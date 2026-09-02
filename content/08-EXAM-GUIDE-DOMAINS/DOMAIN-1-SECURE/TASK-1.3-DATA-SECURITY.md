# Task 1.3 — Determine appropriate data security controls

Task này hỏi cách bảo vệ dữ liệu trong toàn bộ vòng đời: tạo, truyền, lưu, sao chép, backup, archive và xóa. Bạn phải chọn đúng access control, encryption, key management, retention và recovery.

## 1. Giải thích cho người mới

Hãy tách bốn câu hỏi:

1. **Ai được đọc/ghi?** IAM, resource policy, database permission.
2. **Nếu dữ liệu bị lấy cắp, có đọc được không?** Encryption và key access.
3. **Nếu bị xóa/hỏng, có phục hồi được không?** Versioning, backup, replication.
4. **Phải giữ hoặc xóa khi nào?** Lifecycle, retention, legal hold, classification.

Encryption không thay access control. Một principal được phép decrypt vẫn có thể đọc plaintext; một principal không có S3 permission không tự đọc object chỉ vì có KMS permission.

## 2. Data states

| Trạng thái | Ví dụ | Control |
|---|---|---|
| At rest | Object S3, EBS volume, database | SSE, KMS, service-managed encryption |
| In transit | Client tới ALB, app tới DB | TLS, VPN/IPsec khi phù hợp |
| In use | Dữ liệu trong memory khi xử lý | IAM/app controls, isolation, specialized confidential features nếu yêu cầu |

Đề thường nói rõ trạng thái cần bảo vệ. “Encrypt all data” có thể cần cả at rest lẫn in transit.

## 3. KMS mental model

- KMS key là resource có key policy.
- IAM policy và key policy cùng tạo đường authorization phù hợp.
- Envelope encryption: KMS bảo vệ data key; data key mã hóa dữ liệu lớn.
- Rotation thay key material theo cơ chế hỗ trợ; không đồng nghĩa mọi ciphertext cũ được mã hóa lại ngay.
- Grants hỗ trợ delegate use trong một số integration.

### Chọn loại key

| Requirement | Hướng chọn |
|---|---|
| Ít quản trị, dịch vụ tự mã hóa | AWS owned/managed key theo khả năng dịch vụ |
| Cần kiểm soát policy, rotation/audit chi tiết | Customer managed KMS key |
| Giữ key material ngoài KMS | External key store/custom key material khi đề yêu cầu rõ |
| Secret nhỏ cần bảo vệ | Secrets Manager/Parameter Store với KMS, không dùng KMS Encrypt cho file lớn |

## 4. TLS và certificate

- TLS bảo vệ dữ liệu trên kết nối.
- ACM cấp/quản certificate cho các dịch vụ tích hợp.
- Certificate phải đúng domain và được renew/validate phù hợp.
- Terminate TLS ở ALB/CloudFront không đảm bảo origin leg tự động mã hóa; kiểm tra toàn bộ path nếu yêu cầu end-to-end encryption.

## 5. Access, lifecycle và protection

### S3

- Block Public Access giảm public exposure ngoài ý muốn.
- Bucket policy/IAM/access point policy giới hạn principal và action.
- Versioning bảo vệ overwrite/delete nhầm ở mức version.
- Object Lock cung cấp WORM retention; compliance mode nghiêm hơn governance.
- Lifecycle transition/expire dữ liệu theo tuổi và retention.

### Database và volume

- Encryption at rest phải được thiết kế từ đầu theo behavior của engine/resource.
- Snapshot/backup cần encryption và access policy riêng.
- Read replica không thay backup; replication có thể sao chép lỗi logic hoặc delete.

## 6. Backup và replication

| Control | Giải vấn đề chính | Không tự giải |
|---|---|---|
| Backup/snapshot | Khôi phục trạng thái trước đây | Failover tức thời |
| Replication | Bản sao gần hiện tại ở nơi khác | Lịch sử dài hạn chống xóa logic |
| Versioning | Phục hồi phiên bản object | Bảo vệ khỏi principal có quyền permanent delete |
| Object Lock | Ngăn sửa/xóa trong retention | Encryption và availability của application |

Khi cần chống ransomware, xem xét immutable backup/Object Lock, vault access, cross-account copy và tách quyền xóa khỏi quyền vận hành.

## 7. Classification và compliance

Phân loại dữ liệu trước khi chọn control:

- public, internal, confidential, regulated;
- PII, tài chính, health hoặc secrets;
- retention bao lâu;
- được phép ở Region nào;
- ai có thể truy cập và audit evidence nào cần giữ.

Macie hỗ trợ phát hiện dữ liệu nhạy cảm trong S3. AWS Config/Security Hub có thể giúp đánh giá configuration/compliance; CloudTrail data events hỗ trợ audit object API khi bật phù hợp.

## 8. Scenario điển hình

**Đề:** Hồ sơ tài chính trong S3 phải giữ 7 năm, không ai được xóa sớm, bucket private, key do công ty kiểm soát và mọi truy cập phải audit.

**Thiết kế:** S3 Versioning + Object Lock compliance retention; SSE-KMS với customer managed key/key policy chặt; Block Public Access; least-privilege bucket/IAM policies; CloudTrail data events/log retention; lifecycle sang archive class nếu đáp ứng retrieval requirement.

**Loại:** chỉ bật versioning; chỉ dùng lifecycle; bucket public nhưng “đã mã hóa”; dùng governance mode khi requirement nói không ai được bypass.

## 9. Exam traps

- Encryption không thay permission.
- KMS key policy sai có thể chặn cả principal có IAM Allow.
- Key rotation không đồng nghĩa re-encrypt toàn bộ dữ liệu cũ.
- Read replica/CRR không phải historical backup.
- S3 lifecycle không tự replicate sang bucket khác.
- Object Lock cần versioning và không tự mã hóa object.
- ACM certificate chủ yếu cho dịch vụ tích hợp; không phải mọi endpoint đều dùng theo cùng cách.

## 10. Checklist làm được task

- [ ] Phân biệt at rest và in transit controls.
- [ ] Giải thích envelope encryption ở mức khái niệm.
- [ ] Chọn customer managed key khi cần policy/audit/control.
- [ ] Phân biệt versioning, backup, replication và Object Lock.
- [ ] Thiết kế retention/lifecycle không phá compliance.
- [ ] Theo dấu TLS và encryption trên toàn request path.

Học sâu: [Encryption và Data Security](../../01-NGAY-1-SECURITY/02-ENCRYPTION-DATA-SECURITY.md) và [Amazon S3](../../03-NGAY-3-STORAGE-DATABASE/01-S3.md).

Tiếp theo: [Domain 2 — Design Resilient Architectures](../DOMAIN-2-RESILIENT/README.md).
