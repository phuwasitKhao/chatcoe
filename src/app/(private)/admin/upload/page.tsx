"use client";
import { useState } from "react";
import PDFFileUpload, {
  FileProps,
} from "@/components/share/fileupload/PDFFileUploader";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function Page() {
  const [file, setFile] = useState<FileProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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
      setLoadingMsg(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-57px)] flex items-center justify-center bg-white py-10 px-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-[#5A0157]  text-white p-6 text-center">
          <CardTitle className="text-2xl font-bold flex justify-center items-center">
            <Upload className="mr-2 w-6 h-6" /> อัพโหลดเอกสาร PDF
          </CardTitle>
          <CardDescription className="text-gray-100 text-sm">
            เพิ่มไฟล์ PDF ของคุณเข้าสู่ระบบอย่างง่ายดาย
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">อัพโหลดสำเร็จ!</h3>
              <p className="text-gray-500 mt-1">
                ไฟล์ของคุณถูกบันทึกเรียบร้อยแล้ว
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
              {documentId && (
                <div className="mt-3 bg-pink-50 p-3 rounded-lg inline-block">
                  <p className="text-sm text-[#5A0157] font-medium">
                    รหัสเอกสาร: {documentId}
                  </p>
                </div>
              )}
              <Button
                className="mt-5 bg-[#80007b] hover:bg-[#5A0157] transition-colors px-5 py-2 rounded-lg w-full sm:w-auto"
                onClick={() => {
                  setFile(null);
                  setStatus("idle");
                  setDocumentId(null);
                }}
              >
                อัพโหลดไฟล์อื่น
              </Button>
              </div>
            </div>
          ) : status === "error" ? (
            <div className="text-center py-4">
              <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold">เกิดข้อผิดพลาด</h3>
              <p className="text-gray-500 mt-1">
                {loadingMsg || "โปรดลองอีกครั้ง"}
              </p>
              <Button
                className="mt-5 bg-red-500 hover:bg-red-600 transition-colors px-5 py-2 rounded-lg"
                onClick={() => setStatus("idle")}
              >
                ลองอีกครั้ง
              </Button>
            </div>
          ) : file ? (
            <div className="space-y-4">
              <div className="flex items-center p-4 border border-pink-200 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors">
                <div className="bg-pink-100 p-2 rounded-md">
                  <FileText className="text-[#5A0157] w-5 h-5" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-gray-800">{file.title}</h3>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-pink-200 hover:bg-pink-100 bg-white transition-colors text-sm text-[#5A0157]"
                  onClick={() => setFile(null)}
                >
                  เปลี่ยนไฟล์
                </Button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <Loader2 className="animate-spin w-5 h-5 text-[#5A0157] mr-2" />
                  <span className="text-[#5A0157]">{loadingMsg}</span>
                </div>
              ) : (
                <Button
                  onClick={() => submit()}
                  className="w-full bg-[#80007b] hover:bg-[#5A0157] transition-colors py-3 rounded-lg flex items-center justify-center"
                >
                  <span className="mr-2">บันทึกลงฐานข้อมูล</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <div
              onClick={() =>
                (
                  document.querySelector(
                    'input[type="file"]'
                  ) as HTMLInputElement
                )?.click()
              }
              className="border-2 border-dashed border-pink-200 rounded-xl p-8 text-center hover:border-[#5A0157] transition-colors cursor-pointer"
            >
              <PDFFileUpload
                label="อัพโหลดไฟล์ PDF"
                file={file}
                setFile={setFile}
                endpoint="pdfUpload"
                className="pointer-events-none"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="text-sm text-[#5A0157] p-4 bg-white text-center">
          รองรับไฟล์ PDF ขนาดไม่เกิน 16MB
        </CardFooter>
      </Card>
    </div>
  );
}
