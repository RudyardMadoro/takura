#!/bin/bash
set -eu
for bucket in takura-quarantine-local takura-private-clean-local takura-public-derivatives-local takura-backup-local; do
  awslocal --endpoint-url=http://minio:4566 s3api create-bucket --bucket "$bucket" --create-bucket-configuration LocationConstraint=af-south-1 2>/dev/null || true
  awslocal --endpoint-url=http://minio:4566 s3api put-bucket-versioning --bucket "$bucket" --versioning-configuration Status=Enabled
  awslocal --endpoint-url=http://minio:4566 s3api put-public-access-block --bucket "$bucket" --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
done
awslocal --endpoint-url=http://minio:4566 s3api put-bucket-cors --bucket takura-quarantine-local --cors-configuration '{"CORSRules":[{"AllowedOrigins":["http://localhost:4200","http://localhost:4201","http://localhost:4000","http://127.0.0.1:4000"],"AllowedMethods":["POST"],"AllowedHeaders":["content-type","x-amz-checksum-sha256","x-amz-meta-attachment-id","x-amz-meta-sha256","x-amz-server-side-encryption"],"ExposeHeaders":["x-amz-version-id","x-amz-checksum-sha256"],"MaxAgeSeconds":300}]}'
