# AWS migration target

`terraform/` defines a validation-only ECS Fargate/RDS/S3/ECR/ALB target with private task/database
subnets, separate execution/task roles, immutable image inputs and no SQS bypass of the transactional
outbox. Cognito, SES and certificate inputs reference separately approved account resources. Public
media requires CloudFront OAC policy completion before apply; private files remain API-authorised.

Validation does not provision anything:

```sh
terraform -chdir=infra/aws/terraform fmt -check -recursive
terraform -chdir=infra/aws/terraform init -backend=false
terraform -chdir=infra/aws/terraform validate
terraform -chdir=infra/aws/terraform plan -refresh=false -var-file=example.tfvars
```

No apply is authorised by repository automation. Production uses short-lived, environment-restricted
GitHub OIDC and a separate migration task role. Confirm region, AZ availability, NAT versus VPC endpoint
costs, RDS Multi-AZ budget, task counts, connection budget (`API 10 + worker 4` per task), Cognito/MFA,
SES identity and CloudFront OAC in an isolated AWS staging account before migration.
