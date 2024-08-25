import { prismaClient } from "../src/db";

async function main() {
  await prismaClient.availableAction.create({
    data: {
      id: "email",
      name: "Email",
      image:
        "https://media.istockphoto.com/id/1125279178/vector/mail-line-icon.jpg?s=612x612&w=0&k=20&c=NASq4hMg0b6UP9V0ru4kxL2-J114O3TaakI467Pzjzw=",
    },
  });

  await prismaClient.availableAction.create({
    data: {
      id: "sol",
      name: "Solana",
      image:
        "https://cdn.vectorstock.com/i/500p/04/45/solana-logo-coin-icon-isolated-vector-43670445.jpg",
    },
  });

  await prismaClient.availableTrigger.create({
    data: {
      id: "webhook",
      name: "Webhook",
      image:
        "https://a.slack-edge.com/80588/img/services/outgoing-webhook_512.png",
    },
  });
}

main();
