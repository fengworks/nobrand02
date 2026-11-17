#!/bin/bash
# NoBrand Landing — 下載作品圖片到 images/ 資料夾
# 雙擊執行（或在終端機輸入：bash 下載作品圖片.command）
cd "$(dirname "$0")" || exit 1
mkdir -p images
ok=0; fail=0
while IFS='|' read -r name url; do
  [ -z "$name" ] && continue
  if [ -s "images/$name" ]; then echo "略過（已存在）$name"; ok=$((ok+1)); continue; fi
  if curl -fsSL --retry 2 -o "images/$name" "$url"; then echo "✓ $name"; ok=$((ok+1)); else echo "✗ $name"; rm -f "images/$name"; fail=$((fail+1)); fi
done <<'LIST'
hero-01-bainian.jpg|https://www.fengworks.com/wp-content/uploads/bainian-bakery-carry-box-packaging.jpg
hero-02-daijin.jpg|https://www.fengworks.com/wp-content/uploads/IF-20250803_order-1-1500x1069.jpg
hero-03-amiti.jpg|https://www.fengworks.com/wp-content/uploads/amiti3.jpg
hero-04-imos.jpg|https://www.fengworks.com/wp-content/uploads/imos-%E6%A1%88%E4%BE%8B3650%E2%80%8A%C3%97%E2%80%8A2595-09.jpg
hero-05-bernachon.jpg|https://www.fengworks.com/wp-content/uploads/%E5%91%B3%E5%85%A8-%E8%B2%9D%E7%B4%8D%E9%A0%8C-3508x2480px-350dpi-00-6.jpg
poster-bainian.jpg|https://www.fengworks.com/wp-content/uploads/bainian-bakery-lifestyle-pattern-product-collage.jpg
service-01-positioning.jpg|https://www.fengworks.com/wp-content/uploads/amiti8.jpg
service-02-identity.jpg|https://www.fengworks.com/wp-content/uploads/bainian-bakery-logo-identity-breakdown.jpg
service-03-guidelines.jpg|https://www.fengworks.com/wp-content/uploads/%E8%A5%BF%E5%8D%80%E6%89%B6%E8%BC%AA%E6%A1%88%E4%BE%8B-20240923-4.jpg
service-04-applications.jpg|https://www.fengworks.com/wp-content/uploads/amiti7.jpg
work-01-bainian-main.jpg|https://www.fengworks.com/wp-content/uploads/bainian-bakery-storefront-exterior.jpg
work-01-bainian-detail.jpg|https://www.fengworks.com/wp-content/uploads/bainian-bakery-bagel-sleeve-and-loaf-bag-1030x650.jpg
work-02-daijin-main.jpg|https://www.fengworks.com/wp-content/uploads/IF-%E5%A4%A7%E5%A2%83%E7%92%9E%E9%A3%9F-20251030-01-2-1500x1022.jpg
work-02-daijin-detail.jpg|https://www.fengworks.com/wp-content/uploads/IF-20250803_order-4-1030x732.jpg
work-03-imos-main.jpg|https://www.fengworks.com/wp-content/uploads/imos-%E6%A1%88%E4%BE%8B3650%E2%80%8A%C3%97%E2%80%8A2595-01.jpg
work-03-imos-detail.jpg|https://www.fengworks.com/wp-content/uploads/imos-%E6%A1%88%E4%BE%8B3650%E2%80%8A%C3%97%E2%80%8A2595-04.jpg
work-04-amiti-main.jpg|https://www.fengworks.com/wp-content/uploads/amiti2.jpg
work-04-amiti-detail.jpg|https://www.fengworks.com/wp-content/uploads/amiti10.jpg
process-01-discover.jpg|https://www.fengworks.com/wp-content/uploads/%E8%A5%BF%E5%8D%80%E6%89%B6%E8%BC%AA%E6%A1%88%E4%BE%8B-20240923-2-705x498.jpg
process-02-define.jpg|https://www.fengworks.com/wp-content/uploads/IF-20250803_order-2-705x290.jpg
process-03-design.jpg|https://www.fengworks.com/wp-content/uploads/IF-%E5%A4%A7%E5%A2%83%E7%92%9E%E9%A3%9F-20251030-02-1-705x427.jpg
process-04-launch.jpg|https://www.fengworks.com/wp-content/uploads/IF-20250803_order-5-705x501.jpg
addon-01-packaging.jpg|https://www.fengworks.com/wp-content/uploads/%E5%91%B3%E5%85%A8-%E8%B2%9D%E7%B4%8D%E9%A0%8C-3508x2480px-350dpi-00-7-1.jpg
addon-02-website.jpg|https://www.fengworks.com/wp-content/uploads/amiti5.jpg
addon-03-social.jpg|https://www.fengworks.com/wp-content/uploads/amiti9.jpg
addon-04-marketing.jpg|https://www.fengworks.com/wp-content/uploads/IF-%E5%A4%A7%E5%A2%83%E7%92%9E%E9%A3%9F-20251030-06-1-2-1030x731.jpg
addon-05-collaterals.jpg|https://www.fengworks.com/wp-content/uploads/%E8%A5%BF%E5%8D%80%E6%89%B6%E8%BC%AA%E6%A1%88%E4%BE%8B-20240923-8-1030x728.jpg
addon-06-other.jpg|https://www.fengworks.com/wp-content/uploads/IF-%E5%A4%A7%E5%A2%83%E7%92%9E%E9%A3%9F-20251030-05-2-1030x624.jpg
about-01.jpg|https://www.fengworks.com/wp-content/uploads/IF-20250803_order-3-1-1030x732.jpg
about-02.jpg|https://www.fengworks.com/wp-content/uploads/%E5%91%B3%E5%85%A8-%E8%B2%9D%E7%B4%8D%E9%A0%8C-3508x2480px-350dpi-00-2.jpg
LIST
echo ""
echo "完成：成功 $ok 張，失敗 $fail 張。"
echo "現在可以直接打開 index.html，圖片會使用 images/ 資料夾裡的檔案。"
read -n 1 -s -r -p "按任意鍵關閉視窗"
