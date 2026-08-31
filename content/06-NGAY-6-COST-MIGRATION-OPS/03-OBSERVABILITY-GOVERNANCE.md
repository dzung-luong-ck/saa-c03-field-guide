# Observability, IaC và governance

## 1. Bốn câu hỏi để chọn dịch vụ

| Câu hỏi | Dịch vụ chính |
|---|---|
| Hệ thống đang chạy thế nào? metric/log/alarm | CloudWatch |
| Ai gọi API nào, lúc nào, từ đâu? | CloudTrail |
| Cấu hình resource là gì, đã đổi ra sao, compliant không? | AWS Config |
| Request chậm ở service/hop nào? | AWS X-Ray / tracing |

## 2. Amazon CloudWatch

### Metrics và alarms

- AWS service publish metrics theo namespace; custom metric từ app/agent.
- EC2 basic/detailed monitoring khác chu kỳ; memory/disk filesystem thường cần CloudWatch Agent/custom metric.
- Alarm có trạng thái OK/ALARM/INSUFFICIENT_DATA và action như SNS, Auto Scaling, EC2 action.
- Composite alarm giảm alarm noise bằng cách kết hợp nhiều alarm.
- Anomaly detection tạo expected band từ lịch sử; metric math tính tỷ lệ/derived indicator.
- Dashboard hiển thị metric/log/alarm đa account/Region theo cấu hình.

### Logs

- Log group chứa log streams; đặt retention rõ ràng thay vì giữ vô hạn.
- Subscription filter stream log gần real-time tới Lambda/Kinesis/Firehose theo target hỗ trợ.
- Metric filter biến pattern log thành metric/alarm.
- Logs Insights query tương tác; không thay archive/data lake dài hạn.
- CloudWatch Agent thu OS metrics và logs từ EC2/on-prem.

### EventBridge relation

CloudWatch Events trước đây đã trở thành EventBridge. EventBridge phản ứng theo event/state change/schedule; CloudWatch tập trung telemetry/alarm.

## 3. AWS CloudTrail

- Ghi account activity/API events cho governance, compliance, operational/security audit.
- **Event history** cho management events gần đây trong một Region theo giới hạn dịch vụ; không phải archive organization dài hạn.
- **Trail** giao event tới S3, có thể CloudWatch Logs; multi-Region và organization trail cho coverage rộng.
- Management events là control-plane; data events cho object/function/table operations cụ thể và có volume/cost cao hơn.
- Insights phát hiện bất thường trong API activity được hỗ trợ.
- CloudTrail Lake cho collect/immutable event data store/query theo retention cấu hình.

Security:

- S3 bucket riêng, Block Public Access, least privilege.
- Log file validation giúp phát hiện sửa/xóa log sau delivery.
- KMS encryption và alert khi trail/config bị tắt.
- Tách log archive account trong multi-account.

## 4. AWS Config

- Ghi configuration item và relationship của resource được hỗ trợ theo thời gian.
- Config rule đánh giá desired configuration; conformance pack gom rule/remediation.
- Remediation có thể dùng Systems Manager Automation.
- Aggregator tập trung dữ liệu nhiều account/Region.

CloudTrail trả lời “ai đã gọi API”; Config trả lời “resource đã có cấu hình nào và có compliant không”. Config không ngăn thay đổi trước khi xảy ra; SCP/IAM/CloudFormation guardrail có thể phòng ngừa.

## 5. Tracing và application insight

- X-Ray/ADOT/OpenTelemetry trace request xuyên qua service, segment/subsegment, latency và error.
- Service map cho biết dependency/bottleneck.
- Trace sampling kiểm soát overhead/cost; log correlation ID nối trace và log.
- CloudWatch Application Signals/ServiceLens có thể tổng hợp telemetry tùy workload.

Golden signals:

- latency;
- traffic/throughput;
- errors;
- saturation.

Alarm nên dựa vào customer-impact/SLO, không chỉ resource CPU.

## 6. Systems Manager

| Capability | Dùng để |
|---|---|
| Session Manager | Shell vào EC2/on-prem managed node không mở inbound SSH/bastion |
| Run Command | Chạy lệnh fleet có kiểm soát |
| Patch Manager | Scan/install patch theo policy/window |
| State Manager | Duy trì desired configuration |
| Automation | Runbook tự động hóa operational task |
| Parameter Store | Config/secret dạng parameter; phân quyền/KMS |
| Inventory | Thu metadata software/config |
| Maintenance Windows | Lịch task vận hành |

Managed node cần SSM Agent, IAM role và network reachability tới SSM endpoints; có thể dùng interface endpoints để không cần Internet/NAT.

## 7. Infrastructure as Code

### CloudFormation

- Template khai báo resources/dependencies; stack quản lifecycle.
- Change set preview thay đổi trước execute.
- Drift detection phát hiện resource khác template trong phạm vi hỗ trợ.
- Stack policy bảo vệ resource quan trọng khỏi update ngoài ý muốn.
- Nested stacks tái sử dụng component; cross-stack export chia sẻ output nhưng tạo coupling.
- DeletionPolicy/UpdateReplacePolicy giữ snapshot/resource khi xóa/thay tùy cấu hình.

### StackSets

- Triển khai stack đồng nhất qua nhiều account/Region.
- Service-managed permissions tích hợp Organizations; có thể auto-deploy account mới trong OU.
- Hợp baseline IAM role, Config rule, logging, network resources.

IaC giúp repeatable/reviewable; không tự đảm bảo template secure/cost-effective. Dùng pipeline, lint, policy checks, change sets và rollback.

## 8. Multi-account governance

### AWS Organizations và SCP

- OU nhóm account theo policy boundary/lifecycle, không nhất thiết phản chiếu org chart.
- SCP đặt maximum available permissions cho member accounts/OUs; không cấp quyền.
- Explicit deny thắng allow; management account không bị SCP theo cách member account bị áp.
- Resource-based policies và IAM evaluation vẫn phải xét đầy đủ.

### Control Tower

- Thiết lập landing zone multi-account dựa Organizations, IAM Identity Center và governance services.
- Controls/guardrails gồm preventive, detective và proactive theo loại được hỗ trợ.
- Account Factory chuẩn hóa tạo account.
- Không thay toàn bộ thiết kế IAM/network/logging; là orchestration/governance layer.

### Service Catalog

- Admin publish approved product/portfolio; user launch self-service theo constraint.
- Hợp khi team cần tự phục vụ nhưng chỉ dùng architecture đã duyệt.

### AWS RAM

- Resource Access Manager chia sẻ resource được hỗ trợ giữa account, như Transit Gateway/subnet/Route 53 Resolver rule theo khả năng.
- Không phải mọi resource chia sẻ được; kiểm tra supported resource.

## 9. Security/operations services nhận diện

- **AWS Health Dashboard**: event ảnh hưởng account/resource và lịch bảo trì.
- **Trusted Advisor**: best-practice checks.
- **GuardDuty**: threat detection từ log/data sources.
- **Security Hub**: aggregate findings và security standards.
- **Inspector**: vulnerability management cho EC2, container image, Lambda theo hỗ trợ.
- **Macie**: discovery/protection sensitive data trong S3.
- **Audit Manager**: thu evidence cho audit framework.
- **Artifact**: tải compliance reports/agreements.

## 10. Well-Architected Framework

Sáu pillar:

1. Operational Excellence.
2. Security.
3. Reliability.
4. Performance Efficiency.
5. Cost Optimization.
6. Sustainability.

Các nguyên tắc xuyên suốt đề:

- automate thay đổi nhỏ, reversible;
- stop guessing capacity, auto scale;
- test recovery và failure;
- protect data in transit/at rest, least privilege, traceability;
- use managed services và match resource to workload;
- measure cost/business value và loại bỏ idle;
- tối đa utilization, giảm downstream environmental impact.

## 11. Mẫu vận hành multi-account

- Management account chỉ cho org/billing; workload ở member accounts.
- Security tooling/admin account delegated.
- Log archive account nhận organization CloudTrail, Config snapshots và central logs.
- SCP chặn disable logging/rời organization/Region không cho phép theo thiết kế.
- Identity Center/federation + short-lived role, không tạo IAM user khắp account.
- StackSets triển khai baseline; Config aggregator/Security Hub tổng hợp posture.

## 12. Incident pattern

1. Alarm phát hiện symptom customer-impact.
2. Dashboard/metric khoanh vùng.
3. Trace xác định dependency chậm.
4. Logs cung cấp application detail.
5. CloudTrail xác định control-plane change.
6. Config xem before/after configuration.
7. SSM Automation/runbook remediation.
8. Sau incident: postmortem, update alarm/runbook/IaC/game day.

## 13. Bẫy đề thi

- CloudTrail không phải performance monitoring.
- CloudWatch không mặc định ghi mọi API caller identity như CloudTrail.
- Config rule detective không tự chặn create/update.
- SCP không cấp quyền cho principal.
- CloudFormation drift detection không tự sửa drift.
- CloudWatch default EC2 metrics không bao gồm mọi OS metric.
- Session Manager có thể bỏ inbound port 22, nhưng node vẫn cần agent/role/connectivity.
- AWS Health nói event của AWS/account; application custom health cần metrics/alarms.
- Một dashboard đẹp không thay alert/runbook/retention.

## 14. Tự kiểm tra

1. Ai xóa security group rule? → CloudTrail.
2. Bucket từng public lúc nào? → Config timeline + CloudTrail để tìm actor.
3. App latency tăng ở service nào? → tracing/X-Ray + metrics.
4. Alert error rate? → CloudWatch metric/alarm.
5. Fleet không mở SSH? → SSM Session Manager.
6. Deploy baseline 100 accounts? → CloudFormation StackSets.
7. Giới hạn account không được tắt CloudTrail? → SCP preventive + detective controls, thiết kế break-glass.
8. Developer tự launch approved stack? → Service Catalog.
9. Tạo account chuẩn hóa? → Control Tower Account Factory.
10. Vulnerable ECR image/EC2 package? → Inspector.

## Nguồn AWS

- [Amazon CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)
- [AWS CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)
- [AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html)
- [AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
