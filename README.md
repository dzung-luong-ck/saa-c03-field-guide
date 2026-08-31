# SAA-C03 Field Guide

Website đọc và ôn bộ cheatsheet AWS Certified Solutions Architect – Associate (SAA-C03) bằng tiếng Việt trong 7 ngày.

**Website:** [saa-c03-field-guide-vn.ltdunggg.chatgpt.site](https://saa-c03-field-guide-vn.ltdunggg.chatgpt.site)

**GitHub Pages:** [dzung-luong-ck.github.io/saa-c03-field-guide](https://dzung-luong-ck.github.io/saa-c03-field-guide/)

![SAA-C03 Field Guide](./public/og.png)

## Tính năng

- Mục lục 40 bài, nhóm theo lộ trình từ ngày 1 đến ngày 7.
- Render đầy đủ Markdown, bảng, code block và liên kết giữa các bài.
- Tìm kiếm xuyên tiêu đề lẫn nội dung.
- Giao diện responsive, sáng/tối.
- Đánh dấu bài đã học và lưu tiến độ trên thiết bị.
- Điều hướng bài trước/sau và mục lục trong bài.

## Chạy cục bộ

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Build production

```bash
npm run build
```

## Deploy lên GitHub Pages

Workflow [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) tự động build bản static và deploy mỗi khi có commit mới trên nhánh `main`. Có thể chạy thủ công từ tab **Actions** bằng nút **Run workflow**.

Nội dung học nằm trong [`content/`](./content). Website không đưa file PDF nguồn lên repository.

## Lưu ý

AWS có thể thay đổi tính năng, quota và phạm vi kỳ thi. Khi cần con số hoặc behavior hiện hành, hãy kiểm tra AWS Exam Guide và tài liệu dịch vụ chính thức.
