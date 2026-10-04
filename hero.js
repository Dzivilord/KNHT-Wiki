function safe(value, fallback = "Chưa bổ sung") {
  return value && String(value).trim() ? value : fallback;
}

let currentHero = null;
let materialsById = new Map();
let shopsById = new Map();
let farmSourcesById = new Map();

function getMaterial(materialId) {
  return materialsById.get(materialId) || null;
}

function getShop(shopId) {
  return shopsById.get(shopId) || null;
}

function getFarmSource(ref) {
  return {
    ...(farmSourcesById.get(ref.farmSourceId) || { name: ref.farmSourceId }),
    amount: ref.amount
  };
}

function getHeroMaterialIds() {
  return new Set(
    (currentHero?.materials || []).map(ref => ref.materialId)
  );
}

function renderOptionalLink(item) {
  if (!item) return "";

  const name = safe(item.name);

  if (item.link && String(item.link).trim()) {
    return `<a class="wiki-link" href="${item.link}">${name}</a>`;
  }

  return `<span>${name}</span>`;
}

function renderEvolution(hero) {
  const evo = hero.evolutionFrom;

  if (!evo || !evo.name) {
    return hero.note
      ? `<p class="hero-note">${hero.note}</p>`
      : `<p class="hero-note">Thông tin tướng sẽ được bổ sung dần.</p>`;
  }

  const target = evo.heroId
    ? `<a class="wiki-link" href="./hero.html?id=${encodeURIComponent(evo.heroId)}">${evo.name}</a>`
    : `<span>${evo.name}</span>`;

  return `<p class="hero-note">Tiến hoá từ ${target}</p>`;
}

function renderFarmSources(sources) {
  if (!sources || !sources.length) {
    return `<p class="empty small-empty"></p>`;
  }

  return `
    <ul class="farm-source-list">
      ${sources.map((ref, index) => { const source = getFarmSource(ref); return `
        <li><button class="farm-source-action" type="button" data-farm-source-index="${index}" data-farm-source-name="${safe(source.name)}">
          ${safe(source.name)}
          ${source.amount !== null && source.amount !== undefined && source.amount !== "" ? `<span class="farm-source-amount">× ${source.amount}</span>` : ""}
        </button></li>
      `; }).join("")}
    </ul>
  `;
}

function renderExchangePlaces(material) {
  const refs = material.exchangeShops || [];

  if (!refs.length) {
    return `<p class="empty"></p>`;
  }

  return `
    <div class="exchange-places">
      ${refs.map(ref => {
        const shop = getShop(ref.shopId);

        if (!shop) {
          return `<span class="broken-shop">Không tìm thấy shop: ${ref.shopId}</span>`;
        }

        return `
          <button
            class="shop-chip shop-action"
            type="button"
            data-shop-id="${shop.id}"
          >
            ${safe(shop.name)}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function getFirstImage(material) {
  return material?.images?.[0] || null;
}

function renderInfoImages(material) {
  const images = material?.infoImages || [];

  if (!images.length) return "";

  return `
    <div class="material-info-images">
      ${images.map(src => `
        <img src="${src}" alt="${safe(material.name)}">
      `).join("")}
    </div>
  `;
}

function renderMaterialSources(material) {
  const exchangeShops = material?.exchangeShops || [];
  const farmSources = material?.farmSources || [];

  return `
    ${
      exchangeShops.length
        ? `
          <div class="material-source-group">
            <div class="sub-label">Nguồn đổi</div>
            ${renderExchangePlaces(material)}
          </div>
        `
        : `<p class="empty small-empty"></p>`
    }

    ${
      farmSources.length
        ? `
          <div class="material-source-group">
            <div class="sub-label">Nguồn farm</div>
            ${renderFarmSources(farmSources)}
          </div>
        `
        : ""
    }
  `;
}

function renderExchangeMaterials(material) {
  const refs = material.exchangeMaterials || [];

  if (!refs.length) {
    return `<p class="empty"></p>`;
  }

  const heroMaterialIds = getHeroMaterialIds();

  return `
    <div class="exchange-material-list">
      ${refs.map(ref => {
        const ingredient = getMaterial(ref.materialId);

        if (!ingredient) {
          return `
            <div class="exchange-material broken-material">
              Không tìm thấy material: ${ref.materialId}
            </div>
          `;
        }

        const image = getFirstImage(ingredient);
        const existsOnCurrentHeroPage = heroMaterialIds.has(ingredient.id);

        return `
          <div class="exchange-material">
            <button
              class="exchange-material-main material-action"
              type="button"
              data-material-id="${ingredient.id}"
            >
              <div class="exchange-material-head">
                ${
                  image
                    ? `<img class="exchange-material-icon" src="${image}" alt="${safe(ingredient.name)}">`
                    : `<div class="exchange-material-icon material-icon-placeholder">?</div>`
                }

                <div class="exchange-material-title">
                  <strong>${safe(ingredient.name)}</strong>

                  ${
                    ref.amount !== null &&
                    ref.amount !== undefined &&
                    ref.amount !== ""
                      ? `<span class="material-amount">× ${ref.amount}</span>`
                      : ""
                  }

                  <span class="material-action-hint">
                    ${
                      existsOnCurrentHeroPage
                        ? "↓ Xem mục nguyên liệu bên dưới"
                        : "Xem thông tin"
                    }
                  </span>
                </div>
              </div>
            </button>

            <div class="farm-sources">
              ${renderMaterialSources(ingredient)}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function scrollToMainMaterial(materialId) {
  const target = document.getElementById(`material-${materialId}`);

  if (!target) return false;

  target.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  target.classList.remove("material-highlight");
  void target.offsetWidth;
  target.classList.add("material-highlight");

  setTimeout(() => {
    target.classList.remove("material-highlight");
  }, 1600);

  return true;
}

function openMaterialModal(material) {
  if (!material) return;

  const modal = document.getElementById("material-modal");
  const panel = modal.querySelector(".material-modal-panel");
  const image = getFirstImage(material);
  const hasExchangeMaterials =
    material.exchangeMaterials && material.exchangeMaterials.length > 0;

  panel.innerHTML = `
    <button class="modal-close" type="button" aria-label="Đóng">×</button>

    <div class="modal-material-head">
      ${
        image
          ? `<img src="${image}" alt="${safe(material.name)}">`
          : ""
      }

      <div>
        <h2>${safe(material.name)}</h2>
      </div>
    </div>

    <div class="modal-block">
      <div class="sub-label">Thông tin</div>
      <p class="modal-description">${safe(material.description)}</p>
      ${renderInfoImages(material)}
    </div>

    <div class="modal-block">
      ${renderMaterialSources(material)}
    </div>

    ${
      hasExchangeMaterials
        ? `
          <div class="modal-block">
            <div class="sub-label">Nguyên liệu dùng để đổi</div>
            ${renderExchangeMaterials(material)}
          </div>
        `
        : ""
    }
  `;

  panel.scrollTop = 0;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  panel
    .querySelector(".modal-close")
    .addEventListener("click", closeMaterialModal);

  // Material và shop được render động bên trong popup cũng phải click được.
  bindMaterialActionButtons(panel);
  bindShopActionButtons(panel);
  bindFarmSourceActionButtons(panel);
}

function openShopModal(shop) {
  if (!shop) return;

  const modal = document.getElementById("material-modal");
  const panel = modal.querySelector(".material-modal-panel");
  const image = getFirstImage(shop);
  const hasDescription = shop.description && String(shop.description).trim();
  const hasInfoImages = shop.infoImages && shop.infoImages.length > 0;
  const hasLink = shop.link && String(shop.link).trim();

  panel.innerHTML = `
    <button class="modal-close" type="button" aria-label="Đóng">×</button>

    <div class="modal-material-head">
      ${
        image
          ? `<img src="${image}" alt="${safe(shop.name)}">`
          : ""
      }

      <div>
        <h2>${safe(shop.name)}</h2>
        <div class="modal-type">Shop / nơi đổi</div>
      </div>
    </div>

    ${
      hasDescription || hasInfoImages || hasLink
        ? `
          <div class="modal-block">
            ${
              hasDescription
                ? `<p class="modal-description">${shop.description}</p>`
                : ""
            }
            ${renderInfoImages(shop)}
            ${
              hasLink
                ? `<p class="shop-link-row"><a class="wiki-link" href="${shop.link}">Mở liên kết</a></p>`
                : ""
            }
          </div>
        `
        : ""
    }
  `;

  panel.scrollTop = 0;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  panel
    .querySelector(".modal-close")
    .addEventListener("click", closeMaterialModal);
}

function openFarmSourceModal(source) {
  if (!source) return;
  const modal = document.getElementById("material-modal");
  const panel = modal.querySelector(".material-modal-panel");
  const images = [...(source.images || []), ...(source.infoImages || [])];
  const hasDescription = source.description && String(source.description).trim();
  const hasLink = source.link && String(source.link).trim();

  panel.innerHTML = `
    <button class="modal-close" type="button" aria-label="Đóng">×</button>
    <div class="modal-material-head"><div><h2>${safe(source.name)}</h2><div class="modal-type">Nguồn farm</div></div></div>
    ${source.amount !== null && source.amount !== undefined && source.amount !== "" ? `<div class="modal-amount">Số lượng: ${source.amount}</div>` : ""}
    <div class="modal-block">
      ${hasDescription ? `<p class="modal-description">${source.description}</p>` : ""}
      ${renderInfoImages({ name: source.name, infoImages: images })}
      ${hasLink ? `<p class="shop-link-row"><a class="wiki-link" href="${source.link}" target="_blank" rel="noreferrer">Mở liên kết</a></p>` : ""}
      ${!hasDescription && !images.length && !hasLink ? `<p class="modal-description">Chưa có thông tin bổ sung.</p>` : ""}
    </div>
  `;
  panel.scrollTop = 0;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  panel.querySelector(".modal-close").addEventListener("click", closeMaterialModal);
}

function closeMaterialModal() {
  const modal = document.getElementById("material-modal");

  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function bindMaterialActionButtons(scope = document) {
  scope.querySelectorAll(".material-action").forEach(button => {
    // Tránh gắn listener lặp lại nếu popup được mở nhiều lần.
    if (button.dataset.materialBound === "1") return;
    button.dataset.materialBound = "1";

    button.addEventListener("click", event => {
      // Nếu sau này nguồn đổi / nguồn farm là link thật,
      // click link không mở popup material.
      if (event.target.closest("a")) return;

      const materialId = button.dataset.materialId;

      /*
       * Nếu material cũng đang là nguyên liệu chính của hero hiện tại:
       * đóng popup (nếu đang mở) rồi cuộn tới đúng card.
       */
      if (getHeroMaterialIds().has(materialId)) {
        if (scrollToMainMaterial(materialId)) {
          closeMaterialModal();
          return;
        }
      }

      // Nếu không có card trên trang, mở/đổi nội dung popup.
      openMaterialModal(getMaterial(materialId));
    });
  });
}

function bindShopActionButtons(scope = document) {
  scope.querySelectorAll(".shop-action").forEach(button => {
    if (button.dataset.shopBound === "1") return;
    button.dataset.shopBound = "1";

    button.addEventListener("click", event => {
      event.stopPropagation();
      openShopModal(getShop(button.dataset.shopId));
    });
  });
}

function bindFarmSourceActionButtons(scope = document) {
  scope.querySelectorAll(".farm-source-action").forEach(button => {
    if (button.dataset.farmSourceBound === "1") return;
    button.dataset.farmSourceBound = "1";
    button.addEventListener("click", () => {
      const source = [...materialsById.values()]
        .flatMap(material => material.farmSources || [])
        .map(getFarmSource)
        .find(item => item.name === button.dataset.farmSourceName);
      openFarmSourceModal(source || { name: button.dataset.farmSourceName });
    });
  });
}

function setupMaterialActions() {
  const modal = document.getElementById("material-modal");

  // Đưa modal ra khỏi vùng nội dung đang scroll để fixed luôn tính theo viewport.
  if (modal && modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  bindMaterialActionButtons(document);
  bindShopActionButtons(document);
  bindFarmSourceActionButtons(document);

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeMaterialModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMaterialModal();
    }
  });
}

function renderMainMaterials(hero) {
  const refs = hero.materials || [];

  if (!refs.length) {
    return `<p class="empty"></p>`;
  }

  return refs.map((ref, index) => {
    const material = getMaterial(ref.materialId);

    if (!material) {
      return `
        <article class="material-card broken-material">
          Không tìm thấy material: ${ref.materialId}
        </article>
      `;
    }

    return `
      <article
        class="material-card"
        id="material-${material.id}"
      >
        <h3>${index + 1}. ${safe(material.name)}</h3>

        <div class="material-images">
          ${(material.images || []).map(src =>
            `<img src="${src}" alt="${safe(material.name)}">`
          ).join("")}
        </div>

        ${
          material.description
            ? `
              <div class="material-subsection">
                <div class="sub-label">Thông tin</div>
                <p class="material-description">${material.description}</p>
                ${renderInfoImages(material)}
              </div>
            `
            : ""
        }

        <div class="material-subsection">
          <div class="sub-label">Shop / nơi đổi</div>
          ${renderExchangePlaces(material)}
        </div>

        <div class="material-subsection">
          <div class="sub-label">Nguồn farm</div>
          ${material.farmSources?.length ? renderFarmSources(material.farmSources) : `<p class="empty small-empty"></p>`}
        </div>

        <div class="material-subsection">
          <div class="sub-label">Nguyên liệu dùng để đổi</div>
          ${renderExchangeMaterials(material)}
        </div>
      </article>
    `;
  }).join("");
}

async function loadHero() {
  const heroId = new URLSearchParams(location.search).get("id");

  const [heroesResponse, materialsResponse, shopsResponse, farmSourcesResponse] = await Promise.all([
    fetch("./data/heroes.json"),
    fetch("./data/materials.json"),
    fetch("./data/shops.json"),
    fetch("./data/farmSources.json")
  ]);

  const [heroes, materials, shops, farmSources] = await Promise.all([
    heroesResponse.json(),
    materialsResponse.json(),
    shopsResponse.json(),
    farmSourcesResponse.json()
  ]);

  materialsById = new Map(
    materials.map(material => [material.id, material])
  );

  shopsById = new Map(
    shops.map(shop => [shop.id, shop])
  );

  farmSourcesById = new Map(
    farmSources.map(source => [source.id, source])
  );

  const hero = heroes.find(item => item.id === heroId);
  const root = document.getElementById("hero-detail");

  if (!hero) {
    root.innerHTML = "<p>Không tìm thấy tướng.</p>";
    return;
  }

  currentHero = hero;
  document.title = `${hero.name} - Game Wiki`;

  const skills = [
    ["Đánh thường", hero.skills?.basicAttack],
    ["Đánh nộ", hero.skills?.ultimate],
    ["Thiên phú", hero.skills?.talent],
    ["Trái ác quỷ", hero.skills?.devilFruit]
  ];

  root.innerHTML = `
    <section class="hero-head">
      <img src="${hero.image}" alt="${hero.name}">
      <div>
        <h1>${hero.name}</h1>
        ${renderEvolution(hero)}
      </div>
    </section>

    <section class="section">
      <h2>Kỹ năng</h2>

      <div class="skill-grid">
        ${skills.map(([title, value]) => `
          <div class="skill-card">
            <h3>${title}</h3>
            <p>${safe(value)}</p>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <h2>Nguyên liệu chiêu mộ</h2>

      <div class="material-list">
        ${renderMainMaterials(hero)}
      </div>
    </section>

    <div
      id="material-modal"
      class="material-modal"
      aria-hidden="true"
    >
      <div
        class="material-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Thông tin"
      ></div>
    </div>
  `;

  setupMaterialActions();
}

loadHero();
