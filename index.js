<script>
/* ================= SUPABASE INIT ================= */
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";

let supabase = null;

function initSupabase(){
  try {
    if (window.supabase && SUPABASE_URL && SUPABASE_KEY) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) {
    console.log("Supabase init failed");
  }
}

initSupabase();

/* ================= TRACKING ================= */
async function track(event){
  if (!supabase) return;

  try {
    await supabase.from("events").insert([
      {
        event,
        time: new Date().toISOString()
      }
    ]);
  } catch (e) {
    console.log("Track error");
  }
}

/* ================= UI HELPERS ================= */
function $(id){
  return document.getElementById(id);
}

function setCTA(text){
  document.querySelectorAll(".main-cta").forEach(btn=>{
    btn.innerText = text;
  });
}

/* ================= EMAIL POPUP ================= */
function showPopup(){
  if (localStorage.getItem("emailCaptured")) return;

  setTimeout(()=>{
    const popup = $("emailPopup");
    if (popup) popup.style.display = "block";
  }, 4000);
}

function closePopup(){
  const popup = $("emailPopup");
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

  await track("email_capture");

  try {
    if (supabase) {
      await supabase.from("leads").insert([
        { email, created_at: new Date().toISOString() }
      ]);
    }
  } catch (e) {
    console.log("Lead save error");
  }

  setCTA("🔥 Get Drone – $899 (Discount Active)");

  alert("✅ Discount unlocked!");
  closePopup();
}

/* ================= INIT ON LOAD ================= */
window.onload = () => {
  if (localStorage.getItem("emailCaptured")) {
    setCTA("🔥 Get Drone – $899");
  }

  showPopup();
};
</script>