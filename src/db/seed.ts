import bcrypt from "bcryptjs";
import { connectDB } from "./connect";
import { UserModel } from "@/modules/users/models/user.model";
import { ROLES } from "@/constants/roles";

async function seed() {
  await connectDB();

  const password = await bcrypt.hash("12345678", 12);

  await UserModel.findOneAndUpdate(
    { username: "admin" },
    {
      firstName: "Admin",
      lastName: "User",
      name: "Admin User",
      username: "admin",
      password,
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
