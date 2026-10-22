variable "aws_region" { type = string }
variable "environment" {
  type = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production"
  }
}
variable "vpc_cidr" {
  type    = string
  default = "10.40.0.0/16"
}
variable "availability_zones" { type = list(string) }
variable "public_subnet_cidrs" { type = list(string) }
variable "private_subnet_cidrs" { type = list(string) }
variable "api_image_digest" {
  type = string
  validation {
    condition     = can(regex("@sha256:[0-9a-f]{64}$", var.api_image_digest))
    error_message = "use an immutable digest"
  }
}
variable "public_image_digest" { type = string }
variable "staff_image_digest" { type = string }
variable "db_instance_class" {
  type    = string
  default = "db.t4g.small"
}
variable "db_multi_az" {
  type    = bool
  default = false
}
variable "api_desired_count" {
  type    = number
  default = 1
}
variable "cognito_user_pool_arn" { type = string }
variable "ses_identity_arn" { type = string }
variable "certificate_arn" { type = string }
