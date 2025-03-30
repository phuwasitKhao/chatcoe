// app/admin/documents/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/documents");
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const testDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/documents/test?id=${id}`);
      const data = await response.json();
      alert(`ผลการทดสอบ: ${data.matches.length} ข้อความที่เกี่ยวข้อง\n\nตัวอย่างข้อความ: ${data.matches[0]?.text || 'ไม่พบข้อความ'}`);
    } catch (error) {
      console.error("Error testing document:", error);
      alert("เกิดข้อผิดพลาดในการทดสอบเอกสาร");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">เอกสารในระบบ</h1>
      
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">ชื่อไฟล์</th>
                <th className="px-4 py-3 text-left">ประเภท</th>
                <th className="px-4 py-3 text-left">สถานะ</th>
                <th className="px-4 py-3 text-left">วันที่อัปโหลด</th>
                <th className="px-4 py-3 text-left">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc: any) => (
                <tr key={doc._id}>
                  <td className="px-4 py-3">{doc.filename}</td>
                  <td className="px-4 py-3">{doc.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      doc.status === 'indexed' ? 'bg-green-100 text-green-800' : 
                      doc.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {doc.status === 'indexed' ? 'พร้อมใช้งาน' : 
                       doc.status === 'processing' ? 'กำลังประมวลผล' : 'ล้มเหลว'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(doc.createdAt).toLocaleDateString('th-TH')}</td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="outline" 
                      onClick={() => testDocument(doc._id)}
                      disabled={doc.status !== 'indexed'}
                    >
                      ทดสอบเอกสาร
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}