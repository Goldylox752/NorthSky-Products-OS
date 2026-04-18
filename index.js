<script>

/* ================= CLIENT CONFIG ================= */
const CLIENT_CONFIG = {
  brand: "NorthSky Systems",
  product: "Skymaster X1 Inspection System",
  checkout_url: "https://buy.stripe.com/REPLACE_THIS",
  funnel_name: "roofing_inspection_funnel"
};

/* ================= SUPABASE ================= */
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";

let supabase = null;

function initSupabase(){
  if (window.supabase && SUPABASE_URL && SUPABASE_KEY) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
}
initSupabase();

/* ================= SESSION ================= */
function getSessionId(){
  let id = localStorage.getItem("session_id");

  if (!id){
    id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
  }

  return id;
}

const SESSION_ID = getSessionId();

/* ================= UTMS ================= */
function getUTMs(){
  const p = new URLSearchParams(window.location.search);

  return {
    utm_source: p.get("utm_source") || "direct",
    utm_campaign: p.get("utm_campaign") || "none",
    utm_content: p.get("utm_content") || "none",
    cpc: parseFloat(p.get("cpc")) || 0
  };
}

/* ================= TRACK ================= */
async function track(event, meta = {}){

  if (!supabase) return;

  const payload = {
    event,
    meta: {
      ...meta,
      ...getUTMs(),
      session_id: SESSION_ID,
      client: CLIENT_CONFIG.brand,
      funnel: CLIENT_CONFIG.funnel_name,
      url: location.href,
      referrer: document.referrer || "direct",
      user_agent: navigator.userAgent
    },
    time: new Date().toISOString()
  };

  try {
    await supabase.from("events").insert([payload]);
  } catch (e) {
    console.log("track error:", e.message);
  }
}

/* ================= FUNNEL STAGE ================= */
function funnelStage(stage, meta = {}){
  track("funnel_stage", { stage, ...meta });
}

/* ================= LEAD SCORE ================= */
function updateLeadScore(points){

  let score = parseInt(localStorage.getItem("lead_score") || "0");
  score += points;

  localStorage.setItem("lead_score", score);

  if (score >= 50){
    funnelStage("high_intent_lead", { score });
  }
}

/* ================= ROOFFLOW ENTRY ================= */
function captureFromRoofFlow(){

  const p = new URLSearchParams(window.location.search);

  const session_id = p.get("session_id");
  const utm_source = p.get("utm_source");
  const utm_campaign = p.get("utm_campaign");
  const from = p.get("from") || "direct";

  if (session_id){
    localStorage.setItem("session_id", session_id);
  }

  if (utm_source){
    localStorage.setItem("utm_source", utm_source);
  }

  if (utm_campaign){
    localStorage.setItem("utm_campaign", utm_campaign);
  }

  localStorage.setItem("funnel_source", from);

  funnelStage("entry", {
    from,
    session_id,
    utm_source,
    utm_campaign
  });
}

/* ================= CHECKOUT (FIXED) ================= */
function goToCheckout(){

  const utm = getUTMs();

  const url = new URL(CLIENT_CONFIG.checkout_url);

  url.searchParams.set("client_reference_id", SESSION_ID);
  url.searchParams.set("utm_source", utm.utm_source);
  url.searchParams.set("utm_campaign", utm.utm_campaign);
  url.searchParams.set("utm_content", utm.utm_content);
  url.searchParams.set("cpc", utm.cpc);

  funnelStage("checkout_click");
  updateLeadScore(20);

  window.location.href = url.toString();
}

/* ================= CTA TRACKING ================= */
function bindCTAs(){

  document.querySelectorAll("a").forEach(a => {

    a.addEventListener("click", () => {

      const href = a.href || "";

      if (href.includes("stripe")){
        funnelStage("purchase_intent");
        updateLeadScore(30);
      }

      if (href.includes("RoofFlow")){
        funnelStage("roofflow_click");
        updateLeadScore(10);
      }

      if (href.includes("northsky")){
        funnelStage("product_view");
        updateLeadScore(15);
      }

    });

  });
}

/* ================= SCROLL DEPTH ================= */
function trackScroll(){

  let checkpoints = {30:false,60:false,90:false};

  window.addEventListener("scroll", () => {

    const percent =
      window.scrollY /
      (document.body.scrollHeight - window.innerHeight);

    const p = Math.floor(percent * 100);

    if (p > 30 && !checkpoints[30]){
      checkpoints[30] = true;
      funnelStage("scroll_30");
    }

    if (p > 60 && !checkpoints[60]){
      checkpoints[60] = true;
      funnelStage("scroll_60");
      updateLeadScore(5);
    }

    if (p > 90 && !checkpoints[90]){
      checkpoints[90] = true;
      funnelStage("scroll_90");
      updateLeadScore(10);
    }

  });
}

/* ================= LEAD INSERT (FIXED FUNCTION) ================= */
async function saveLead(email){

  if (!supabase) return;

  await supabase.from("leads").insert([{
    email,
    session_id: SESSION_ID,
    client: CLIENT_CONFIG.brand,
    funnel: CLIENT_CONFIG.funnel_name,
    source: getUTMs().utm_source,
    lead_score: parseInt(localStorage.getItem("lead_score") || "0"),
    created_at: new Date().toISOString()
  }]);
}

/* ================= EMAIL ================= */
async function submitEmail(){

  const email = document.getElementById("emailInput")?.value?.trim();

  if (!email || !email.includes("@")){
    alert("Enter valid email");
    return;
  }

  localStorage.setItem("emailCaptured", "true");

  funnelStage("email_capture");
  updateLeadScore(25);

  await track("email_capture", { email });
  await saveLead(email);

  alert("Access unlocked!");
  document.getElementById("popup").style.display = "none";
}

/* ================= INIT ================= */
window.addEventListener("load", () => {

  captureFromRoofFlow();

  funnelStage("page_view");

  bindCTAs();
  trackScroll();

});

</script>