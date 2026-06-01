import bcrypt from "bcryptjs";
import { HTTP_STATUS } from "@/constants/http";
import { UserModel } from "@/modules/users/models/user.model";
import { AppError } from "@/utils/AppError";
import { issueSessionTokens } from "./session.service";

type AuthRequestContext = {
  ip?: string;
  userAgent?: string;
};

export async function registerUser(
  input: { name: string; email: string; password: string; avatarUrl?: string },
  context?: AuthRequestContext
) {
  const exists = await UserModel.exists({ email: input.email });
  if (exists) throw new AppError("Email already exists", HTTP_STATUS.CONFLICT);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
    avatarUrl: input.avatarUrl,
  });

  const authUser = user.toAuthJSON();
  return {
    user: authUser,
    ...(await issueSessionTokens(authUser, context)),
  };
}

export async function loginUser(input: { email: string; password: string }, context?: AuthRequestContext) {
  const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");
  if (!user || !user.isActive) throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);

  const authUser = user.toAuthJSON();
  return {
    user: authUser,
    ...(await issueSessionTokens(authUser, context)),
  };
}
