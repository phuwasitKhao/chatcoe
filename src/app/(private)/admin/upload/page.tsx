"use client";
import { useState } from "react";
import PDFFileUpload, { FileProps } from "@/components/share/fileupload/PDFFileUploader";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function Page() {
  const [file, setFile] = useState<FileProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [documentId, setDocumentId] = useState<string | null>(null);

  async function submit() {
    try {
      setLoading(true);
      setStatus("loading");
      setLoadingMsg("กำลังบันทึกข้อมูลลงฐานข้อมูล...");

      if (!file) {
        throw new Error("ไม่พบไฟล์");
      }

      const saveResponse = await fetch("/api/v1/documents/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.title,
          url: file.url,
          type: "pdf",
          uploadedBy: "user",
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("ไม่สามารถบันทึกเอกสารได้");
      }

      const saveData = await saveResponse.json();
      setDocumentId(saveData.documentId);
      setLoadingMsg("กำลังประมวลผลเอกสาร...");

      const processResponse = await fetch("/api/v1/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: saveData.documentId,
          urls: [file.url],
          fileTypes: ["pdf"],
        }),
      });

      if (!processResponse.ok) {
        throw new Error("ไม่สามารถประมวลผลเอกสารได้");
      }

      const processData = await processResponse.json();

      if (processData.status === "success") {
        setStatus("success");
        setLoadingMsg("อัพโหลดและประมวลผลเสร็จสมบูรณ์");
      } else {
        throw new Error(processData.error || "การประมวลผลล้มเหลว");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
      setLoadingMsg(error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 py-10 px-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-blue-500 text-white p-6 text-center">
          <CardTitle className="text-2xl font-bold flex justify-center items-center">
            <Upload className="mr-2 w-6 h-6" /> อัพโหลดเอกสาร PDF
          </CardTitle>
          <CardDescription className="text-gray-100 text-sm">
            เพิ่มไฟล์ PDF ของคุณเข้าสู่ระบบอย่างง่ายดาย
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {status === "success" ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold mt-4">อัพโหลดสำเร็จ!</h3>
              <p className="text-gray-500">ไฟล์ของคุณถูกบันทึกเรียบร้อยแล้ว</p>
              {documentId && <p className="text-sm text-blue-500">รหัสเอกสาร: {documentId}</p>}
              <Button className="mt-4 bg-blue-500 hover:bg-blue-600" onClick={() => { setFile(null); setStatus("idle"); setDocumentId(null); }}>อัพโหลดไฟล์อื่น</Button>
            </div>
          ) : status === "error" ? (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold mt-4">เกิดข้อผิดพลาด</h3>
              <p className="text-gray-500">{loadingMsg || "โปรดลองอีกครั้ง"}</p>
              <Button className="mt-4 bg-red-500 hover:bg-red-600" onClick={() => setStatus("idle")}>ลองอีกครั้ง</Button>
            </div>
          ) : file ? (
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-lg bg-gray-100">
                <FileText className="text-blue-500 w-6 h-6" />
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">{file.title}</h3>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button variant="outline" onClick={() => setFile(null)}>เปลี่ยนไฟล์</Button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="animate-spin w-6 h-6" />
                  <span>{loadingMsg}</span>
                </div>
              ) : (
                <Button onClick={() => submit()} className="w-full bg-blue-500 hover:bg-blue-600">บันทึกลงฐานข้อมูล</Button>
              )}
            </div>
          ) : (
            <PDFFileUpload label="อัพโหลดไฟล์ PDF" file={file} setFile={setFile} endpoint="pdfUpload" />
          )}
        </CardContent>

        <CardFooter className="text-sm text-gray-500 p-4 bg-gray-100 text-center">
          รองรับไฟล์ PDF ขนาดไม่เกิน 16MB
        </CardFooter>
      </Card>
    </div>
  );
}