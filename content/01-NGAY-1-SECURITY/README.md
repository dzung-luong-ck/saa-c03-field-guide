# Ngày 1 — Design Secure Architectures

Domain Security chiếm 30% phần tính điểm, cao nhất trong bốn domain. Mục tiêu ngày 1 là hiểu **quyền hiệu lực**, **ranh giới trách nhiệm**, **mã hóa** và **dịch vụ security phù hợp**.

## Thứ tự học

1. [IAM và multi-account governance](01-IAM-ORGANIZATIONS.md) — 75 phút.
2. [Encryption và data security](02-ENCRYPTION-DATA-SECURITY.md) — 60 phút.
3. [Application và network security](03-APPLICATION-NETWORK-SECURITY.md) — 60 phút.
4. [Câu hỏi tự kiểm tra](04-CAU-HOI-TU-KIEM-TRA.md) — 30 phút.
5. 40–60 practice questions domain Security — 90 phút.

## Checklist cuối ngày

- [ ] Giải thích được implicit deny, explicit allow và explicit deny.
- [ ] Biết SCP, permissions boundary và session policy chỉ **giới hạn**, không cấp quyền.
- [ ] Phân biệt identity policy, resource policy và role trust policy.
- [ ] Thiết kế được cross-account role và workforce federation.
- [ ] Phân biệt KMS, CloudHSM, ACM, Secrets Manager và Parameter Store.
- [ ] Phân biệt WAF, Shield, Network Firewall và Firewall Manager.
- [ ] Phân biệt GuardDuty, Inspector, Macie, Security Hub và Detective.
- [ ] Khóa được S3 origin sau CloudFront bằng OAC.

## Liên hệ với slide PDF

- IAM cơ bản: trang 24–40.
- S3 security: trang 313–334.
- Advanced Identity: trang 619–647.
- Security and Encryption: trang 648–696.

Slide được dùng để mở rộng scenario và mental model. Các quota/giới hạn thay đổi theo thời gian được kiểm tra lại bằng AWS Docs.

## Câu nhắc nhanh

```text
Authenticate: bạn là ai?
Authorize: bạn được làm gì?
Protect: ngăn/chặn điều gì?
Detect: phát hiện điều gì?
Respond: xử lý và điều tra ra sao?
```

Tiếp theo: [IAM và Organizations](01-IAM-ORGANIZATIONS.md).
