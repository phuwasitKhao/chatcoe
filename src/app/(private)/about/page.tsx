"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faInstagram } from "@fortawesome/free-brands-svg-icons";
import kandit from "@public/images/kandit.jpg";
import apiwat from "@public/images/apiwat.jpg";
import beer from "@public/images/beer.jpg";

const teamMembers = [
  {
    name: "Apiwat Chakunchon",
    githubUrl: "https://github.com/apiwatfresh",
    githubUsername: "GuildZ",
    stuID: "653040465-3",
    instagramUrl: "https://www.instagram.com/gz.fresh.10/",
    instagramUsername: "gz.fresh.10",
    profileImage: apiwat,
  },
  {
    name: "Kandit Tanthanathewin",
    githubUrl: "https://github.com/KanditT",
    githubUsername: "KanditT",
    stuID: "653040617-6",
    instagramUrl: "https://www.instagram.com/kandis0123/",
    instagramUsername: "kandis0123",
    profileImage: kandit,
  },
  {
    name: "Nawamin Onkhwan",
    githubUrl: "https://github.com/Carely-Dev",
    githubUsername: "Carely-Dev",
    stuID: "653040132-0",
    instagramUrl: "https://www.instagram.com/9nigx_tt",
    instagramUsername: "9nigx_tt",
    profileImage: kandit,
  },
  {
    name: "Kritsada Mahanam",
    githubUrl: "https://github.com/kritsada653040438",
    githubUsername: "kritsada653040438",
    stuID: "653040438-6",
    instagramUrl: "https://www.instagram.com/pleumksdx_/",
    instagramUsername: "pleumksdx_",
    profileImage: kandit,
  },
  {
    name: "บักกอข้าว",
    githubUrl: "https://github.com/kritsada653040438",
    githubUsername: "kritsada653040438",
    stuID: "653040438-6",
    instagramUrl: "https://www.instagram.com/pleumksdx_/",
    instagramUsername: "pleumksdx_",
    profileImage: kandit,
  },
  {
    name: "Sakjanon Kamoldung",
    githubUrl: "https://github.com/sakjanonkk",
    githubUsername: "sakjanonkk",
    stuID: "653040142-7",
    instagramUrl: "https://www.instagram.com/sakjanonk/",
    instagramUsername: "sakjanonk",
    profileImage: beer,
  },
];

const AboutPage = () => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen py-12 px-6 bg-background text-foreground">
      <h1 className="text-3xl font-bold text-center mb-12">👨‍💻 Our Team</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {teamMembers.map((member, index) => (
          <Card key={`${member.name}-${index}`} className="overflow-hidden">
            <CardHeader className="flex items-center flex-col space-y-4">
              <Image
                src={
                  typeof member.profileImage === "string"
                    ? member.profileImage
                    : member.profileImage.src
                }
                alt={member.name}
                width={100}
                height={100}
                className="rounded-full object-cover border shadow-md"
              />
              <div className="text-center">
                <h2 className="text-xl font-semibold">{member.name}</h2>
                <p className="text-sm text-muted-foreground">{member.stuID}</p>
              </div>
            </CardHeader>

            <CardContent className="flex justify-center gap-6 text-muted-foreground">
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-black"
              >
                <FontAwesomeIcon icon={faGithub} />
                <span className="text-sm">{member.githubUsername}</span>
              </a>
              <a
                href={member.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-pink-500"
              >
                <FontAwesomeIcon icon={faInstagram} />
                <span className="text-sm">{member.instagramUsername}</span>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
