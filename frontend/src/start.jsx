import { useState } from "react";
import "./start.css"; // Import CSS file for styling

const Start = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setLoading(true);
      setResult(""); // Clear previous result
      console.log("Uploading...");

      const response = await fetch(
        "http://localhost:5000/extract-expiry-date",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Parsed Data:", data);

      setResult(
        data.expiryDate
          ? `Extracted Expiry Date: ${data.expiryDate}`
          : "No expiry date detected."
      );
    } catch (error) {
      console.error("Error:", error);
      setResult("Failed to extract expiry date.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Expiry Date Extractor</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="upload-button"
      >
        {loading ? "Extracting..." : "Extract Expiry Date"}
      </button>

      {result && <div className="result-box">{result}</div>}
    </div>
  );
};

export default Start;
