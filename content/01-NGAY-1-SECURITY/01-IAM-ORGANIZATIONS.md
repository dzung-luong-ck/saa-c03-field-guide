# IAM và AWS Organizations

## 1. Shared Responsibility trước khi nói về IAM

| Lớp | AWS chịu trách nhiệm | Khách hàng chịu trách nhiệm |
|---|---|---|
| Physical | Datacenter, power, hardware | Chọn Region phù hợp compliance |
| Virtualization | Hypervisor, managed infrastructure | Guest OS trên EC2, AMI, app |
| Network | Global network và service infrastructure | VPC routes, SG, NACL, endpoints |
| Identity | IAM service availability | Users, roles, policies, MFA, federation |
| Data | Durability của service theo cam kết | Classification, access, encryption, backup settings |

Nguyên tắc: dịch vụ càng managed thì AWS quản nhiều lớp hơn, nhưng khách hàng luôn chịu trách nhiệm về **dữ liệu, danh tính và cấu hình truy cập**.

## 2. IAM principals và credential lifetime

| Principal | Credential | Dùng khi | Tránh khi |
|---|---|---|---|
| Root user | Password/MFA; có quyền đặc biệt | Account setup và tác vụ chỉ root làm được | Daily admin, automation, access keys |
| IAM user | Password hoặc access key dài hạn | Legacy case không thể dùng federation/role | Workload trên AWS; hàng loạt workforce users |
| IAM role | STS temporary credentials | AWS services, federation, cross-account | Khi hệ thống bắt buộc credential dài hạn |
| Federated principal | Phiên tạm qua SAML/OIDC/Identity Center | Workforce hoặc external identity | Tạo trùng identities trong từng account |
| Service principal | Service AWS assume role | Cho service hành động thay bạn | Gán quá rộng hoặc thiếu source conditions |

### Root checklist

- Bật MFA, ưu tiên hardware/passkey phù hợp chính sách.
- Không tạo root access key.
- Dùng email/phone do tổ chức kiểm soát.
- Không dùng root cho console hàng ngày.
- Thiết lập alternate contacts và quy trình break-glass.

## 3. User, group, role

### IAM user

- Đại diện một danh tính trong một account.
- Có thể có console password và/hoặc access keys.
- Access key là secret dài hạn; phải rotation, monitoring và loại bỏ nếu không dùng.

### IAM group

- Chỉ chứa users; không chứa role và không lồng group.
- Policy gắn vào group được users thừa hưởng.
- Dùng group để quản permission theo job function nếu vẫn dùng IAM users.

### IAM role

- Không có password/access key dài hạn.
- Có **trust policy** xác định principal nào được assume.
- Có permissions policies xác định role session được làm gì.
- STS cấp Access Key ID, Secret Access Key và Session Token có thời hạn.

### Instance profile và workload roles

- EC2 nhận role qua instance profile và metadata service.
- Lambda execution role cấp quyền function gọi AWS APIs.
- ECS task role cấp quyền cho application container.
- EKS dùng pod identity/IRSA-style integration phù hợp thay vì chia sẻ node role quá rộng.
- Không lưu access key trong user data, AMI, container image hoặc source code.

## 4. Policy anatomy

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "ReadReports",
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::example-reports/*",
    "Condition": {
      "StringEquals": {"aws:PrincipalTag/Department": "Finance"}
    }
  }]
}
```

| Field | Ý nghĩa | Bẫy |
|---|---|---|
| Effect | Allow hoặc Deny | Explicit Deny thắng Allow |
| Action/NotAction | API actions | Wildcard quá rộng vi phạm least privilege |
| Resource/NotResource | ARN áp dụng | Bucket ARN và object ARN khác nhau |
| Principal/NotPrincipal | Ai được áp dụng, chủ yếu resource/trust policy | Không thường xuất hiện trong identity policy |
| Condition | Điều kiện context | Phải hiểu key, operator và giá trị absent |

### ARN S3 rất hay nhầm

```text
s3:ListBucket  → arn:aws:s3:::my-bucket
s3:GetObject   → arn:aws:s3:::my-bucket/*
```

Quyền bucket-level không tự cho object-level và ngược lại.

## 5. Các loại policy

| Policy | Gắn vào | Vai trò |
|---|---|---|
| Identity-based | User/group/role | Cấp/deny hành động cho identity |
| Resource-based | S3 bucket, SQS queue, SNS topic, KMS key… | Chỉ rõ principal truy cập resource |
| Trust policy | IAM role | Ai/service nào được `sts:AssumeRole` |
| Permissions boundary | User/role | Trần quyền identity có thể nhận |
| Session policy | STS session | Thu hẹp quyền trong phiên |
| SCP | Root/OU/account trong Organizations | Guardrail quyền tối đa của member accounts |
| RCP | Resource control trong Organizations nơi hỗ trợ | Guardrail cho resources của member accounts |

## 6. Policy evaluation mental model

```text
1. Mặc định: implicit deny
2. Tìm explicit deny trong mọi policy áp dụng
   → có deny phù hợp: DENY
3. Xác định có explicit allow hợp lệ không
4. Intersect với boundary, session policy, SCP/RCP
5. Cross-account: cả phía principal và resource/trust phải tạo đường allow phù hợp
```

### Công thức giản lược

```text
Identity permissions ∪ resource permissions
∩ permissions boundary
∩ session policy
∩ SCP/RCP guardrails
− mọi explicit deny
```

Đây là mental model, không thay toàn bộ nuance theo loại principal/resource. Hai ngoại lệ cần nhớ: IAM role trust policy và KMS key policy đòi hỏi đường cho phép phù hợp của chính loại policy đó.

### Ví dụ 1 — Admin nhưng SCP deny

- User có `AdministratorAccess` trong member account.
- SCP ở OU deny `ec2:TerminateInstances`.
- Kết quả: không terminate được. Administrator policy không vượt SCP.

### Ví dụ 2 — Boundary không có allow

- Identity policy cho `s3:*`.
- Boundary chỉ cho `s3:GetObject`.
- Kết quả: chỉ quyền nằm trong giao; boundary không tự cấp `GetObject` nếu identity policy không cấp.

### Ví dụ 3 — Explicit deny bucket policy

- Role policy allow `s3:GetObject`.
- Bucket policy deny request không dùng TLS qua condition `aws:SecureTransport=false`.
- HTTP request bị deny; HTTPS có thể được allow nếu các policy khác cho phép.

## 7. Conditions quan trọng

| Condition key | Use case |
|---|---|
| `aws:SourceIp` | Giới hạn client IP; cẩn thận khi request đi qua service/proxy |
| `aws:RequestedRegion` | Hạn chế Region cho API actions phù hợp |
| `aws:PrincipalOrgID` | Chỉ principal trong Organization |
| `aws:MultiFactorAuthPresent` | Yêu cầu MFA cho sensitive action |
| `aws:PrincipalTag/*` | ABAC theo tag của principal |
| `aws:ResourceTag/*` | Giới hạn theo tag resource |
| `aws:SourceArn`/`aws:SourceAccount` | Giảm confused deputy khi AWS service gọi resource |
| `s3:prefix` | Giới hạn ListBucket theo prefix |
| `kms:ViaService` | Chỉ dùng KMS key qua service xác định |

### Confused deputy

Khi một AWS service được cho phép thao tác resource thay nhiều customers, attacker có thể lợi dụng permission rộng. Giảm rủi ro bằng:

- service principal đúng;
- `aws:SourceArn`;
- `aws:SourceAccount`;
- resource ARN cụ thể;
- external ID cho một số third-party cross-account scenarios.

## 8. Cross-account access

### Cách A — Assume role

```text
Account A principal
  ├─ identity policy: Allow sts:AssumeRole role-B
  ↓
Account B role trust policy
  ├─ trusts Account A principal/account
  └─ role permissions: access resource B
```

Khi assume role, principal dùng permissions của role session. Phù hợp khi cần nhiều actions/resources trong account đích hoặc muốn audit session rõ.

### Cách B — Resource-based policy

```text
Account B resource policy → cho principal Account A truy cập trực tiếp
```

Phù hợp với service hỗ trợ resource policies như S3/SQS/SNS/KMS. Không phải service nào cũng hỗ trợ.

### Chọn cách nào?

| Yêu cầu | Ưu tiên |
|---|---|
| Một bucket/queue cụ thể | Resource policy có thể đơn giản |
| Nhiều resources/actions trong account đích | Cross-account role |
| Principal cần giữ permission hiện tại trong cùng request flow | Xem resource policy semantics của service |
| Third-party SaaS quản nhiều customers | Role + external ID theo thiết kế vendor |

## 9. Workforce và customer identities

| Nhu cầu | Dịch vụ |
|---|---|
| Nhân viên truy cập nhiều AWS accounts/apps | IAM Identity Center |
| Kết nối corporate IdP qua SAML/OIDC | Federation + Identity Center/IAM role |
| App end users đăng ký/đăng nhập | Cognito user pool |
| End users cần AWS temporary credentials | Cognito identity pool |
| Managed Microsoft AD đầy đủ | AWS Managed Microsoft AD |
| Proxy request tới AD on-prem | AD Connector |
| Directory nhẹ, ít tính năng | Simple AD |

### User pool vs identity pool

- User pool: user directory, authentication, tokens, hosted UI/federation.
- Identity pool: đổi authenticated/guest identity thành AWS temporary credentials qua roles.
- Một application có thể dùng cả hai.

## 10. Organizations, OU, SCP và Control Tower

### AWS Organizations

- Quản nhiều accounts theo hierarchy.
- Consolidated billing.
- Service Control Policies.
- Tag policies, backup policies và các policy types được hỗ trợ.
- Organization trail/config/backup patterns cho governance tập trung.

### Organizational Unit

Nhóm accounts theo policy boundary, ví dụ:

```text
Root
├── Security OU
│   ├── Log Archive account
│   └── Security Tooling account
├── Infrastructure OU
│   └── Shared Services account
├── Workloads-Prod OU
└── Workloads-NonProd OU
```

Không nhất thiết phản ánh sơ đồ tổ chức nhân sự; nên phản ánh governance và lifecycle.

### SCP

- Áp vào root/OU/account; member account thừa hưởng.
- Xác định maximum available permissions.
- Không cấp permission.
- Explicit deny thắng.
- Management account không bị SCP hạn chế như member accounts.
- Service-linked roles có special behavior; không dùng SCP như thay thế IAM design.

### Allowlist vs denylist strategy

| Strategy | Cách hoạt động | Trade-off |
|---|---|---|
| Denylist | Mặc định rộng, deny hành động nguy hiểm | Dễ vận hành; phải cập nhật khi service mới xuất hiện |
| Allowlist | Chỉ service/action được phép | Kiểm soát chặt; overhead cao và dễ block innovation |

### AWS Control Tower

- Dựng landing zone theo best practices.
- Account Factory tạo account chuẩn hóa.
- Controls/guardrails preventive, detective và proactive tùy loại.
- Tích hợp Organizations, IAM Identity Center, CloudTrail, Config và các service governance.
- Chọn khi đề nói multi-account landing zone với least manual setup.

### AWS RAM

Chia sẻ resources được hỗ trợ giữa accounts/OU/organization, ví dụ subnets hoặc Transit Gateway. Dùng khi muốn central ownership nhưng distributed consumption; không phải cơ chế cấp mọi loại IAM permission.

## 11. IAM tools

| Tool | Mục đích |
|---|---|
| Credentials report | Báo cáo account-level về users, password, access keys, MFA |
| Access Advisor | Service permissions được cấp và lần truy cập gần nhất |
| IAM Access Analyzer | Phát hiện external/public access và hỗ trợ generate/refine policies |
| Policy Simulator | Mô phỏng quyết định allow/deny theo context |
| CloudTrail | Audit API activity, ai làm gì và lúc nào |

## 12. Scenario reasoning

### Scenario A — Developers cần truy cập 20 accounts

Yêu cầu: đăng nhập bằng corporate identity, revoke tập trung, không tạo user lặp.

Lựa chọn: IAM Identity Center kết nối IdP, permission sets map vào roles tại accounts. Không tạo 20 IAM users/người.

### Scenario B — Lambda đọc S3

Yêu cầu: không lưu secret, rotate tự động.

Lựa chọn: Lambda execution role có `s3:GetObject` đúng prefix, bucket policy nếu cần guardrail. Không tạo access key.

### Scenario C — Team tự tạo role nhưng không được vượt quyền

Yêu cầu: delegated IAM administration.

Lựa chọn: cho phép tạo role với mandatory permissions boundary. Boundary đặt trần; creator vẫn phải gắn identity policy phù hợp.

### Scenario D — Chặn mọi public S3 trong toàn Organization

Kết hợp:

- SCP/Control Tower control để ngăn hành động cấu hình nguy hiểm nơi phù hợp.
- S3 Block Public Access tại organization/account/bucket.
- AWS Config/Security Hub để detect drift.
- Remediation và central logging.

## 13. Exam traps

- `AdministratorAccess` không vượt explicit deny/SCP.
- Group không chứa role hoặc group khác.
- Role không có access key dài hạn.
- SCP không áp permissions trực tiếp và không thay identity policy.
- Permissions boundary không phải resource policy.
- Cognito không phải workforce SSO mặc định; IAM Identity Center không phải customer user directory mặc định.
- Bucket policy `Allow` public không có tác dụng nếu Block Public Access chặn phù hợp.

## Tự kiểm tra 5 câu

1. Vì sao role tốt hơn access key cho EC2 workload?
2. Boundary allow S3 nhưng identity policy không allow S3 thì kết quả gì?
3. User có admin nhưng OU SCP deny KMS deletion thì kết quả gì?
4. Khi nào dùng Cognito identity pool?
5. Khi nào resource policy đơn giản hơn cross-account role?

Đáp án nằm trong [bộ câu hỏi cuối ngày](04-CAU-HOI-TU-KIEM-TRA.md).

Tiếp theo: [Encryption và Data Security](02-ENCRYPTION-DATA-SECURITY.md).
