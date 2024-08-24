/* eslint-disable @next/next/no-img-element */
"use client";

import { BACKEND_URL } from "@/app/config";
import { LinkButtton } from "@/components/buttons/LinkButtton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { ZapCell } from "@/components/ZapCell";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState([]);
  const [availableTriggers, setAvailableTriggers] = useState([]);


  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/trigger/available`)
      .then((x) => setAvailableTriggers(x.data.availableTriggers));

    axios
      .get(`${BACKEND_URL}/api/v1/action/available`)
      .then((x) => setAvailableActions(x.data.availableActions));
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}

export default function Page() {
  const { availableActions, availableTriggers } =
    useAvailableActionsAndTriggers();
  const [selectedTrigger, setSelectedTrigger] = useState<{
    name: string;
    id: string;
  }>();
  const [selectedActions, setSelectedActions] = useState<
    {
      index: number;
      availableActionId: string;
      availableActionName: string;
    }[]
  >([]);

  const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(
    null
  );

  const router = useRouter()

  return (
    <div className="bg-slate-200">
      <div className="flex justify-end bg-slate-200 pt-4 px-2">
        <PrimaryButton
          onClick={async () => {
            if (!selectedTrigger?.id) return;

            const response = await axios.post(
              `${BACKEND_URL}/api/v1/zap`,
              {
                availableTriggerId: selectedTrigger?.id,
                triggerMetadata: {},
                actions: selectedActions.map((a) => ({
                  availableActionId: a.availableActionId,
                  actionMetadata: {},
                })),
              },
              {
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              }
            );

            router.push("/dashboard")
          }}
        >
          Publish
        </PrimaryButton>
      </div>
      <div className="w-full min-h-screen bg-slate-200 flex flex-col justify-center pt-4">
        <div className="flex justify-center w-full">
          <ZapCell
            onClick={() => setSelectedModalIndex(1)}
            name={selectedTrigger?.name ? selectedTrigger?.name : "Trigger"}
            index={1}
          />
        </div>
        <div className="w-full pt-2 pb-2">
          {selectedActions.map((action, idx) => (
            <div key={idx} className="flex justify-center pt-2">
              <ZapCell
                name={
                  action.availableActionName
                    ? action.availableActionName
                    : "Action"
                }
                index={action.index}
                onClick={() => setSelectedModalIndex(action.index)}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <LinkButtton
            onClick={() => {
              setSelectedActions((a) => [
                ...a,
                {
                  index: a.length + 2,
                  availableActionId: "",
                  availableActionName: "",
                },
              ]);
            }}
          >
            <p className="text-2xl">+</p>
          </LinkButtton>
        </div>
      </div>
      {selectedModalIndex && (
        <Modal
          availableItems={
            selectedModalIndex === 1 ? availableTriggers : availableActions
          }
          index={selectedModalIndex}
          onSelect={(props: null | { name: string; id: string }) => {
            if (props === null) {
              setSelectedModalIndex(null);
              return;
            }
            if (selectedModalIndex === 1) {
              setSelectedTrigger({
                id: props.id,
                name: props.name,
              });
              setSelectedModalIndex(null);
              return;
            } else {
              setSelectedActions((a) => {
                let newActions = [...a];
                // console.log(newActions);
                // console.log(selectedModalIndex);

                newActions[selectedModalIndex - 2] = {
                  index: selectedModalIndex,
                  availableActionId: props.id,
                  availableActionName: props.name,
                };
                return newActions;
              });
              setSelectedModalIndex(null);
              return;
            }
          }}
        />
      )}
    </div>
  );
}

function Modal({
  index,
  onSelect,
  availableItems,
}: {
  index: number;
  onSelect: (props: null | { name: string; id: string }) => void;
  availableItems: { id: string; name: string; image?: string }[];
}) {
  return (
    <div className="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex bg-slate-500 bg-opacity-45">
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
            <div className="text-xl">
              Select {index === 1 ? "Trigger" : "Action"}
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="default-modal"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="p-4 md:p-5 space-y-4">
            {availableItems.map(({ id, name, image }) => {
              return (
                <div
                  className="flex border p-4 cursor-pointer hover:bg-slate-200"
                  key={id}
                  onClick={() => {
                    onSelect({
                      id,
                      name,
                    });
                  }}
                >
                  <img
                    src={image}
                    alt=""
                    width={30}
                    className="rounded-full mr-4"
                  />
                  <div className="flex flex-col justify-center">{name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
