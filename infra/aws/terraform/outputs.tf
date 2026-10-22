output "database_endpoint" {
  value     = aws_db_instance.postgres.address
  sensitive = true
}
output "storage_bucket_arns" { value = { for k, v in aws_s3_bucket.storage : k => v.arn } }
output "task_role_arn" { value = aws_iam_role.task.arn }
