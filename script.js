let timings = null;

async function getLocation() {
  const cityNameElement = document.getElementById("city-name");
  if (cityNameElement) cityNameElement.innerText = "Konumunuz saptanıyor...";

  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (data.city) {
      fetchVakitler(`city=${data.city}&country=${data.country_name}`);
    } else {
      throw new Error();
    }
  } catch (error) {
    console.warn("ipapi engellendi veya hata verdi, yedek servis deneniyor...");
    try {
      const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
      const data = await response.json();
      if (data.city) {
        fetchVakitler(`city=${data.city}&country=${data.country}`);
      } else {
        throw new Error();
      }
    } catch (backupError) {
      console.error("Konum alınamadı, varsayılan şehir (İstanbul) yükleniyor.");
      fetchByCityName("Istanbul");
    }
  }
}

async function fetchVakitler(queryParam) {
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?${queryParam}&method=13`,
    );
    const result = await res.json();

    if (result.code === 200) {
      timings = result.data.timings;

      const hijriDay = parseInt(result.data.date.hijri.day);
      const hijriMonthNumber = parseInt(result.data.date.hijri.month.number);

      let gosterilecekGun = hijriDay - 1;

      let orucText =
        hijriMonthNumber === 9
          ? `Bugün orucun ${gosterilecekGun}. günü`
          : "Ramazan dönemi değil";

      let orucEl = document.getElementById("oruc-gun");
      if (!orucEl) {
        orucEl = document.createElement("p");
        orucEl.id = "oruc-gun";
        orucEl.className =
          "text-center text-xs text-yellow-300 mt-2 font-medium";
        document.querySelector(".counter-container").appendChild(orucEl);
      }
      orucEl.innerText = orucText;

      document.getElementById("sahur-vakti").innerText = timings.Fajr;
      document.getElementById("iftar-vakti").innerText = timings.Maghrib;

      const cityInput = document.getElementById("city-input").value;
      let displayCity =
        cityInput || result.data.meta.timezone.split("/")[1].replace("_", " ");
      document.getElementById("city-name").innerText =
        displayCity.toUpperCase();

      const dateParts = result.data.date.gregorian.date.split("-");
      const aylar = [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ];
      const gunler = [
        "Pazar",
        "Pazartesi",
        "Salı",
        "Çarşamba",
        "Perşembe",
        "Cuma",
        "Cumartesi",
      ];
      const tarihObj = new Date(
        `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`,
      );

      document.getElementById("current-date").innerText =
        `${gunler[tarihObj.getDay()]}, ${dateParts[0]} ${aylar[parseInt(dateParts[1]) - 1]} ${dateParts[2]}`;

      updateTimer();
    }
  } catch (e) {
    console.error("Vakit çekme hatası:", e);
    showAlert("Vakit bilgileri alınamadı!");
  }
}

function updateTimer() {
  if (!timings) return;

  const now = new Date();
  const [iH, iM] = timings.Fajr.split(":");
  const [aH, aM] = timings.Maghrib.split(":");

  let imsak = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    iH,
    iM,
  );
  let iftar = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    aH,
    aM,
  );

  const bg = document.getElementById("bg-layer");
  if (now >= iftar || now < imsak) {
    document.body.style.backgroundColor = "#020617";
    if (bg) bg.style.filter = "blur(15px) brightness(0.4)";
  } else {
    document.body.style.backgroundColor = "#0f172a";
    if (bg) bg.style.filter = "blur(15px) brightness(0.7)";
  }

  let hedef, etiket;
  if (now < imsak) {
    etiket = "İmsaka Kalan";
    hedef = imsak;
  } else if (now < iftar) {
    etiket = "İftara Kalan";
    hedef = iftar;
  } else {
    etiket = "Yarınki İmsaka Kalan";
    hedef = new Date(imsak.getTime() + 24 * 60 * 60 * 1000);
  }

  const diff = hedef - now;
  const h = Math.floor(diff / 3600000)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((diff % 3600000) / 60000)
    .toString()
    .padStart(2, "0");
  const s = Math.floor((diff % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  document.getElementById("target-label").innerText = etiket;
  document.getElementById("countdown").innerText = `${h}:${m}:${s}`;
}

const kabulEdilenSehirler = new Set([
  "adana",
  "adiyaman",
  "afyonkarahisar",
  "agri",
  "amasya",
  "ankara",
  "antalya",
  "artvin",
  "aydin",
  "balikesir",
  "bilecik",
  "bingol",
  "bitlis",
  "bolu",
  "burdur",
  "bursa",
  "canakkale",
  "cankiri",
  "corum",
  "denizli",
  "diyarbakir",
  "edirne",
  "elazig",
  "erzincan",
  "erzurum",
  "eskisehir",
  "gaziantep",
  "giresun",
  "gumushane",
  "hakkari",
  "hatay",
  "isparta",
  "mersin",
  "istanbul",
  "izmir",
  "kars",
  "kastamonu",
  "kayseri",
  "kirklareli",
  "kirsehir",
  "kocaeli",
  "konya",
  "kutahya",
  "malatya",
  "manisa",
  "kahramanmaras",
  "mardin",
  "mugla",
  "mus",
  "nevsehir",
  "nigde",
  "ordu",
  "rize",
  "sakarya",
  "samsun",
  "siirt",
  "sinop",
  "sivas",
  "tekirdag",
  "tokat",
  "trabzon",
  "tunceli",
  "sanliurfa",
  "usak",
  "van",
  "yozgat",
  "zonguldak",
  "aksaray",
  "bayburt",
  "karaman",
  "kirikkale",
  "batman",
  "sirnak",
  "bartin",
  "ardahan",
  "igdir",
  "yalova",
  "karabuk",
  "kilis",
  "osmaniye",
  "duzce",
]);

function normalizeCity(str) {
  if (!str) return "";
  return str
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

function fetchByCityName(city = null) {
  const inputField = document.getElementById("city-input");
  let rawCityName = city || inputField.value.trim();
  if (!rawCityName) return;

  const safeCityName = normalizeCity(rawCityName);

  if (!kabulEdilenSehirler.has(safeCityName)) {
    showAlert(`"${rawCityName}" şehri henüz desteklenmiyor!`);
    return;
  }

  const apiFormat =
    safeCityName.charAt(0).toUpperCase() + safeCityName.slice(1);
  fetchVakitler(`city=${apiFormat}&country=Turkey`);
}

function showAlert(msg) {
  const alertEl = document.getElementById("custom-alert");
  const contentEl = document.getElementById("alert-content");
  document.getElementById("alert-message").innerText = msg;

  alertEl.classList.remove("hidden");
  setTimeout(() => contentEl.classList.remove("scale-90"), 10);
}

function closeAlert() {
  const alertEl = document.getElementById("custom-alert");
  const contentEl = document.getElementById("alert-content");

  contentEl.classList.add("scale-90");
  setTimeout(() => alertEl.classList.add("hidden"), 200);
}

document.getElementById("city-input").addEventListener("input", function (e) {
  this.value = this.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, "");
});

function resetApp() {
  document.getElementById("city-input").value = "";

  getLocation();

  console.log("Uygulama sıfırlandı ve konum aranıyor...");
}

document.getElementById("city-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") fetchByCityName();
});

getLocation();
setInterval(updateTimer, 1000);
