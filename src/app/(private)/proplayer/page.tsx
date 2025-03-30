import React from "react";
import Image from "next/image";
import pro from "@public/images/promptpay.png";

const propage = () => {
  return (
    <div>
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 ">
        <Image
          src={pro}
          alt="Pro Player"
          width={300}
          height={300}
          className=" rounded-2xl shadow-xl"
        />
        <p className="pt-4 text-2xl text-zinc-600 ">
          หากแชทไม่ตอบสนองรบกวนสแกนจ่าย หรือติดต่อ แอดมินกอข้าว ig : synx._z
        </p>
      </div>
    </div>
  );
};

export default propage;
