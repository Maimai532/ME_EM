// Chạy 1 lần: node set-cors.mjs
// Cần: B2_KEY_ID, B2_APP_KEY (application key ID + key, KHÔNG phải access key S3),
// và BUCKET_NAME đúng tên bucket (vd "me-em-audio")
// Chạy: B2_KEY_ID=xxx B2_APP_KEY=yyy BUCKET_NAME=me-em-audio node set-cors.mjs

const KEY_ID = process.env.B2_KEY_ID;
const APP_KEY = process.env.B2_APP_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;

if (!KEY_ID || !APP_KEY || !BUCKET_NAME) {
  console.error("Thiếu B2_KEY_ID / B2_APP_KEY / BUCKET_NAME");
  process.exit(1);
}

async function main() {
  // 1. Authorize
  const authRes = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
    headers: {
      Authorization: "Basic " + Buffer.from(`${KEY_ID}:${APP_KEY}`).toString("base64"),
    },
  });
  const auth = await authRes.json();
  if (!authRes.ok) {
    console.error("Authorize thất bại:", auth);
    process.exit(1);
  }
  const apiUrl = auth.apiInfo?.storageApi?.apiUrl || auth.apiUrl;
  const authorizationToken = auth.authorizationToken;
  const accountId = auth.apiInfo?.storageApi?.accountId || auth.accountId;

  if (!apiUrl || !authorizationToken || !accountId) {
    console.error("Không lấy được apiUrl/accountId từ response authorize:", JSON.stringify(auth, null, 2));
    process.exit(1);
  }

  // 2. Tìm bucketId theo tên
  const listRes = await fetch(`${apiUrl}/b2api/v3/b2_list_buckets`, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accountId, bucketName: BUCKET_NAME }),
  });
  const listData = await listRes.json();
  if (!listRes.ok || !listData.buckets?.length) {
    console.error("Không tìm thấy bucket:", listData);
    process.exit(1);
  }
  const bucket = listData.buckets[0];

  // 3. Update CORS rules
  const corsRules = [
    {
      corsRuleName: "allow-browser-direct-upload",
      allowedOrigins: [
        "http://localhost:5173",
        "https://YOUR-PRODUCTION-DOMAIN.vercel.app", // đổi thành domain thật của bạn
      ],
      allowedOperations: [
        "b2_upload_file",
        "b2_upload_part",
        "s3_put",
        "s3_get",
        "s3_head",
      ],
      allowedHeaders: ["*"],
      exposeHeaders: ["ETag"],
      maxAgeSeconds: 3600,
    },
  ];

  const updateRes = await fetch(`${apiUrl}/b2api/v3/b2_update_bucket`, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accountId,
      bucketId: bucket.bucketId,
      corsRules,
    }),
  });
  const updateData = await updateRes.json();
  if (!updateRes.ok) {
    console.error("Update CORS thất bại:", updateData);
    process.exit(1);
  }
  console.log("Đã set CORS rules thành công:", JSON.stringify(updateData.corsRules, null, 2));
}

main();
