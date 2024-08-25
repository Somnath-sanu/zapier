/* eslint-disable @next/next/no-img-element */
"use client";

import { DarkButton } from "@/components/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { LinkButtton } from "@/components/buttons/LinkButtton";
import {  useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";

interface Zap {
  id: string;
  triggerId: string;
  createdAt: Date;
  userId: number;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}

function useZaps() {
  const [loading, setLoading] = useState(false);
  const [zaps, setZaps] = useState([]);

  
  

  useEffect(() => {
    async function main() {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/v1/zap`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setZaps(response.data.zaps);
      setLoading(false);
    }

    main();
  }, []);

  return {
    loading,
    zaps,
  };
}

export default function Page() {
  const { loading, zaps } = useZaps();

  const router = useRouter();
  return (
    <div className="flex justify-center">
      <div className="pt-8 max-w-screen-lg w-full">
        <div className="flex justify-between pr-8">
          <div className="text-2xl font-bold">My Zaps</div>
          <DarkButton
            onClick={() => {
              router.push("/zap/create");
            }}
          >
            Create
          </DarkButton>
        </div>
        {loading ? (
          "Loading..."
        ) : (
          <div className="flex justify-center">
            <ZapTable zaps={zaps} />
          </div>
        )}
      </div>
    </div>
  );
}

function ZapTable({ zaps }: { zaps: Zap[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [localZaps, setLocalZaps] = useState(zaps);
  const handleDelete = async (id: string) => {
    setPending(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/zap/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setLocalZaps(localZaps.filter((zap) => zap.id !== id));
    } catch (error) {
      console.error("Failed to delete zap:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-4 p-8 max-w-screen-lg w-full">
      <div className="flex pb-2">
        <div className="flex-1">Name</div>
        <div className="flex-1">ID</div>
        <div className="flex-1">Created At</div>
        <div className="flex-1">Webhook URL</div>
        <div className="flex-1">Go</div>
      </div>

      {localZaps.map((z) => (
        <div key={z.id} className="flex border-b py-4 border-t">
          <div className="flex-1 flex items-center justify-start">
            <img src={z.trigger.type.image} alt="" className="" width={30} />{" "}
            {z.actions.map((x, idx) => (
              <img src={x.type.image} alt="" width={30} key={idx} className="pr-0.5" />
            ))}
          </div>
          <div className="flex-1">{z.id}</div>
          <div className="flex-1 px-3 text-wrap truncate">
            {new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(z.createdAt))}
          </div>
          <div className="flex-1">{`${HOOKS_URL}/hooks/catch/1/${z.id}`}</div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <LinkButtton
              onClick={() => {
                router.push("/zap/" + z.id);
              }}
            >
              Go
            </LinkButtton>
            <PrimaryButton onClick={() => handleDelete(z.id)} pending={pending}>
              {" "}
              Delete{" "}
            </PrimaryButton>
          </div>
        </div>
      ))}
    </div>
  );
}
