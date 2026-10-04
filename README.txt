GAME WIKI FRONTEND V6 — REUSABLE MATERIALS + SHOPS
===================================================

MỤC TIÊU
========
- Material chỉ định nghĩa một lần trong data/materials.json.
- Shop / nơi đổi chỉ định nghĩa một lần trong data/shops.json.
- Hero tham chiếu material bằng materialId.
- Material tham chiếu shop bằng shopId.
- Material và Shop là hai loại dữ liệu riêng, nhưng đều có thể mở popup thông tin.


CẤU TRÚC DỮ LIỆU
=================

data/heroes.json
  Hero
    -> materials[].materialId

data/materials.json
  Material
    -> exchangeMaterials[].materialId
    -> exchangeShops[].shopId

data/shops.json
  Shop / nơi đổi


HEROES.JSON
===========

Ví dụ:

"materials": [
  {
    "materialId": "ltt_buggy"
  },
  {
    "materialId": "bara_bara"
  }
]


MATERIALS.JSON
==============

Ví dụ:

{
  "id": "road_poneglyphs",
  "name": "Road Poneglyphs",
  "images": [
    "./images/materials/Basics/roadPoneglyphs.png"
  ],
  "description": "Thông tin...",
  "farmSources": [],
  "exchangeMaterials": [
    {
      "materialId": "log_pose",
      "amount": 3000
    }
  ],
  "infoImages": [],
  "exchangeShops": [
    {
      "shopId": "gift_exchange_center"
    }
  ]
}

Ý nghĩa:
- images: ảnh/icon chính của material.
- description: mô tả material.
- farmSources: nguồn farm trực tiếp; để [] nếu không có.
- exchangeMaterials: material khác cần dùng để đổi.
- infoImages: ảnh minh họa bổ sung trong phần Thông tin.
- exchangeShops: nơi/shop dùng để đổi material, tham chiếu bằng shopId.


SHOPS.JSON
==========

Ví dụ:

{
  "id": "gift_exchange_center",
  "name": "Trung Tâm Đổi Quà",
  "images": [],
  "description": "",
  "link": null,
  "infoImages": []
}

Có thể bổ sung ảnh, mô tả, link hoặc ảnh minh họa về sau mà không phải sửa từng material.


HÀNH VI CLICK MATERIAL
======================
- Nếu material được tham chiếu cũng là material chính của hero hiện tại:
  click sẽ cuộn xuống đúng card material trên trang.
- Nếu material không có card chính trên trang:
  click sẽ mở popup thông tin material.

Popup có thể đóng bằng:
- nút X;
- click nền tối bên ngoài;
- phím ESC.


HÀNH VI CLICK SHOP
==================
- Tên shop trong mục "Shop / nơi đổi" có thể click.
- Click sẽ mở popup thông tin shop.
- Shop dùng chung cơ chế popup với material nhưng dữ liệu vẫn tách riêng.


SHOP ĐÃ TÁCH TRONG BẢN V6
=========================
- Trung Tâm Đổi Quà -> gift_exchange_center
- Shop Wano -> wano_shop
- Shop Cam -> orange_shop
- Event Đặc Biệt - Big Event -> big_event


LỢI ÍCH
=======
Ví dụ Trung Tâm Đổi Quà được nhiều material sử dụng:
- shops.json chỉ định nghĩa 1 lần.
- các material chỉ giữ shopId = "gift_exchange_center".
- sửa tên, mô tả hoặc ảnh shop 1 lần -> mọi nơi sử dụng được cập nhật.

Project vẫn là frontend tĩnh và có thể deploy trực tiếp như trước.
