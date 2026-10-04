const heroOrder = [
  ["Buggy-S", "Buggy_s.png"],
  ["Denjiro-S", "Denjiro_S.png"],
  ["X.Drake-S", "XDrake_S.png"],
  ["Saturn-S", "Saturn_S.png"],
  ["Garp-S2", "Garp_S2.png"],
  ["Hawkins-S", "Hawkins_S.png"],
  ["Hiyori-S", "Hiyori_s.png"],
  ["Roger-S", "Roger_S.png"],
  ["Oven-S", "Oven_S.png"],
  ["Hitetsu-S", "Hitetsu_S.png"],
  ["Rayleigh-S2", "Rayleigh_S2.png"],
  ["Smoothie-S", "Smoothie_S.png"],
  ["Shanks-S2", "Shanks_S2.png"],
  ["Akainu-S2", "Akainu_S2.png"],
  ["Kizaru-S", "Kizaru_S2.png"],
  ["Aramaki-S", "Aramaki_S.png"],
  ["Yasopp-S", "Yassop_S.png"],
  ["Daifuku-S", "Daifuku_S.png"],
  ["Momonosuke-S", "Momonosuke_S.png"],
  ["Kaido-S", "Kaido_S.png"],
  ["Reiju-S", "Reiju_S.png"],
  ["Judge-S", "Judge_S.png"],
  ["Cracker-S", "Cracker_S.png"],
  ["Ichiji-S", "Ichiji_S.png"],
  ["Benn Beckman-S", "Bennbeckman_S.png"],
  ["Bigmom-S", "Bigmom_S.png"],
  ["Nami-S3", "Nami_S3.png"],
  ["Enel-S", "Enel_S.png"],
  ["Sabo-S2", "Sabo_S2.png"],
  ["Boa-S2", "Boa_S2.png"],
  ["Law-S2", "Law_S2.png"],
  ["Zoro-S2", "Zoro_S2.png"],
  ["Franky-S2", "Franky_S2.png"],
  ["Usopp-S2", "Ussop_S2.png"],
  ["King-S", "King_S.png"],
  ["Brook-S2", "Brook_S2.png"],
  ["Robin-S2", "Robin_S2.png"],
  ["Uta-S", "Uta_S.png"],
  ["Yamato-S2", "Yamato_S2.png"],
  ["Jinbei-S2", "Jinbe_S2.png"],
  ["Sanji-S2", "Sanji_S2.png"],
  ["Chopper-S2", "Chopper_S2.png"],
  ["Tesoro-S", "Tesoro_S.png"],
  ["Mihawk-S2", "Mihawk_S2.png"],
  ["Ace-S2", "Ace_S2.png"],
  ["Oden-S", "Oden_S.png"],
  ["Luffy-SM", "Luffy_SM.png"],
  ["Nami-S2", "Nami_S2.png"],
  ["Queen-S", "Queen_S.png"],
  ["Killer-S", "Killer_S.png"],
  ["Marco-S", "Marco_S.png"],
  ["Nico Robin-S", "Robin_S.png"],
  ["Jinbe-S", "Jinbe_S.png"],
  ["Jack-S", "Jack_S.png"],
  ["Lucci-S", "Lucci_S.png"],
  ["Katakuri-S", "Katakuri_S.png"],
  ["Râu đen-S", "Rauden_S.png"],
  ["Aokiji-S", "Aokiji_S.png"],
  ["Eustass Kid-S", "Eustasskid_S.png"],
  ["Kizaru-S", "Kizaru_S.png"],
];
const slug = (name) => name.replace(/[^a-zA-Z0-9]/g, "_");
async function loadHeroes() {
  const details = await (await fetch("./data/heroes.json")).json();
  const byImage = new Map(details.map((h) => [h.image?.split("/").pop()?.toLowerCase(), h]));
  const cards = heroOrder.map(([name, file]) => {
    const detail = byImage.get(file.toLowerCase());
    return {
      id: detail?.id || slug(name),
      name: detail?.name || name,
      image: `./images/heroes/${file}`,
    };
  });
  const pageSize = 30;
  let page = Number(new URLSearchParams(location.search).get("page")) || 1;
  const total = Math.ceil(cards.length / pageSize);
  const visible = cards.slice((page - 1) * pageSize, page * pageSize);
  document.getElementById("hero-grid").innerHTML =
    visible
      .map(
        (h) =>
          `<a class="hero-card" href="./hero.html?id=${encodeURIComponent(h.id)}"><img src="${h.image}" alt="${h.name}"><div class="hero-name">${h.name}</div></a>`,
      )
      .join("") +
    `<div class="hero-pagination">${Array.from({ length: total }, (_, i) => `<a class="button ${i + 1 === page ? "primary" : ""}" href="./index.html?page=${i + 1}">${i + 1}</a>`).join("")}</div>`;
}
loadHeroes();
