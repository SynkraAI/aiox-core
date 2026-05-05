import os
from urllib.parse import urlparse

import boto3

BUCKET = os.getenv("S3_BUCKET") or os.getenv("S3_BUCKET_NAME", "shapeai-photos-dev")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1"),
)


def download_photo(url: str) -> bytes:
    """Download photo from S3 using the object key extracted from the presigned URL."""
    key = _extract_key(url)
    response = s3_client.get_object(Bucket=BUCKET, Key=key)
    return response["Body"].read()


def _extract_key(url: str) -> str:
    """Extract S3 object key from URL path."""
    return urlparse(url).path.lstrip("/")


def delete_photo(url: str) -> None:
    s3_client.delete_object(Bucket=BUCKET, Key=_extract_key(url))


def delete_all_photos(*urls: str) -> None:
    """Delete all photo URLs from S3 — LGPD compliance."""
    for url in urls:
        if url:
            delete_photo(url)
