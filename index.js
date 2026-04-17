<script>
/* ================= CONFIG ================= */
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";

/* ================= INIT ================= */
let supabase = null;

function initSupabase(){
  try {
    if (window.supabase && SUPABASE_URL && SUPABASE_KEY) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log("Supabase connected");
    }
  } catch (e) {
    console.log("Supabase init failed");
  }
}

initSupabase();

/* ================= TRACKING ================= */
async function track(event, meta = {}) {
  console.log("TRACK:", event, meta);

  if (!supabase) return;

  try {
    await supabase.from("events").insert([
      {
        event,
        meta,
        time: new Date().toISOString()
      }
    ]);
  } catch (e) {
    console.log("Track error");
  }
}

/* ================= HELPERS ================= */
function $(id){
  return document.getElementById(id);
}

/* ================= CTA TRACKING ================= */
function trackCTAClicks(){
  document.querySelectorAll("a[href*='stripe.com']").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      track("cta_click", { location: btn.innerText });
    });
  });
}

/* ================= EMAIL POPUP ================= */
function showPopup(){
  if (localStorage.getItem("emailCaptured")) return;

  setTimeout(()=>{
    const popup = $("popup"); // FIXED ID
    if (popup) popup.style.display = "block";
  }, 3000);
}

function closePopup(){
  const popup = $("popup");
  if (popup) popup.style.display = "none";
}

/* ================= EMAIL SUBMIT ================= */
async function submitEmail(){
  const input = $("emailInput");
  const email = input ? input.value.trim() : "";

  if (!email.includes("@")){
    alert("Enter a valid email");
    return;
  }

  localStorage.setItem("emailCaptured", "true");

  await track("email_capture", { email });

  try {
    if (supabase) {
      await supabase.from("leads").insert([
        { email, created_at: new Date().toISOString() }
      ]);
    }
  } catch (e) {
    console.log("Lead save error");
  }

  alert("✅ Bonus unlocked!");
  closePopup();
}

/* ================= PAGE INIT ================= */
window.addEventListener("load", () => {
  track("page_view");

  trackCTAClicks();
  showPopup();
});
</script>