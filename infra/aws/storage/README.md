# Phase 06 storage boundaries

Create four separately permissioned, versioned S3 buckets per environment: quarantine, private-clean, approved-public-derivatives and backup. Block Public Access stays enabled on every bucket. Browsers receive only five-minute POST policies for one generated quarantine key; they receive no AWS credentials and no list/get permission. The application can copy an exact quarantine object version into private-clean. The scanner can read private-clean but cannot publish. The media publisher writes derivatives only after scan, rights and editorial clearance. CloudFront Origin Access Control may read only approved-public-derivatives.

Apply the examples only through a reviewed environment pipeline. Replace every placeholder and restrict CORS to the deployed public origin. Production must use KMS keys, Object Lock or an equivalent write-protection policy for pinned clean objects, access logging and a separately controlled backup account.

Local MinIO and ClamAV in `compose.yaml` are emulators; their policy, checksum, versioning, CORS and immutability behaviour does not prove AWS behaviour. Use an opt-in isolated AWS account harness for staging evidence. No provisioning is performed by the application.
