const data = JSON.parse(require("fs").readFileSync("/tmp/ls-data.json", "utf8"));
console.log("Top-level keys:", Object.keys(data));
if (data.result) {
  console.log("result keys:", Object.keys(data.result));
  if (data.result.data) {
    console.log("data keys:", Object.keys(data.result.data));
    const d = data.result.data;
    // Check for nested structures
    for (const k of Object.keys(d)) {
      const v = d[k];
      if (Array.isArray(v)) {
        console.log("  " + k + ": Array[" + v.length + "]");
        if (v.length > 0) console.log("    first:", JSON.stringify(v[0]).substring(0, 200));
      } else if (typeof v === "object" && v !== null) {
        console.log("  " + k + ": Object{" + Object.keys(v).join(",") + "}");
      } else {
        console.log("  " + k + ":", v);
      }
    }
  }
}
if (data.error) {
  console.log("ERROR:", JSON.stringify(data.error).substring(0, 500));
}
