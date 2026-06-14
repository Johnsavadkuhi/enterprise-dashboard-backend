// src/realtime/socket.redis.ts

import Redis from "ioredis";

export type SocketRedisClients = {
  pubClient: Redis;
  subClient: Redis;
  close: () => Promise<void>;
};

export async function createSocketRedisClients(redisUrl: string): Promise<SocketRedisClients> {
  const pubClient = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  const subClient = pubClient.duplicate();

  pubClient.on("error", (error) => {
    console.error("[Socket Redis Pub Error]", error.message);
  });

  subClient.on("error", (error) => {
    console.error("[Socket Redis Sub Error]", error.message);
  });

  await Promise.all([pubClient.connect(), subClient.connect()]);

  return {
    pubClient,
    subClient,

    close: async () => {
      await Promise.allSettled([pubClient.quit(), subClient.quit()]);
    },
  };
}
