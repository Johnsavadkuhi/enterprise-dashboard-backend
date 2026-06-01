import bcrypt from "bcryptjs";
import { connectDB } from "./connect";
import { UserModel } from "@/modules/users/models/user.model";
import { ROLES } from "@/constants/roles";

async function seed() {
  await connectDB();

  const passwordHash = await bcrypt.hash("12345678", 12);

  await UserModel.findOneAndUpdate(
    { email: "admin@example.com" },
    {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      roles: [ROLES.ADMIN],
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log("Seed completed");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
