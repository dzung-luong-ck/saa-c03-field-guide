# Ngày 4 — Networking, DNS và Edge

Networking thường làm câu hỏi dài vì một đáp án có thể sai ở route table, security, protocol hoặc cost. Hãy luôn vẽ packet path từ source tới destination và đường return.

## Thứ tự học

1. [VPC Foundations](01-VPC-FOUNDATIONS.md) — 75 phút.
2. [Connectivity và Hybrid](02-CONNECTIVITY-HYBRID.md) — 60 phút.
3. [ELB, Route 53 và Edge](03-ELB-ROUTE53-EDGE.md) — 75 phút.
4. 50 practice questions — 90 phút.

## Checklist cuối ngày

- [ ] Giải thích vì sao subnet public hoặc private dựa trên route.
- [ ] Vẽ path private EC2 → NAT Gateway → IGW → internet.
- [ ] Vẽ path private EC2 → S3 gateway endpoint.
- [ ] Phân biệt SG và NACL, gồm return/ephemeral ports.
- [ ] Phân biệt peering, Transit Gateway và PrivateLink.
- [ ] Phân biệt gateway endpoint và interface endpoint.
- [ ] Phân biệt VPN và Direct Connect.
- [ ] Chọn ALB/NLB/GWLB.
- [ ] Chọn Route 53 routing policy.
- [ ] Chọn CloudFront hoặc Global Accelerator.

## Liên hệ slide PDF

- Route 53: trang 193–226.
- CloudFront/Global Accelerator: trang 335–349.
- Amazon VPC: trang 697–774.
- Blocking IP và transfer architectures: trang 810–821.

Tiếp theo: [VPC Foundations](01-VPC-FOUNDATIONS.md).
