import { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { getUserById, updateUser } from "@kontaktar/database";

// Schema definitions
const UserSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  phone_number: Type.Union([Type.String(), Type.Null()]),
  display_name: Type.Union([Type.String(), Type.Null()]),
  role: Type.Union([Type.Literal("user"), Type.Literal("admin")]),
  created_at: Type.String({ format: "date-time" }),
});

const UserUpdateSchema = Type.Object({
  display_name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
});

const UserIdParams = Type.Object({
  userId: Type.String({ format: "uuid" }),
});

const ErrorResponse = Type.Object({
  statusCode: Type.Number(),
  error: Type.String(),
  message: Type.String(),
});

const SuccessResponse = Type.Object({
  message: Type.String(),
});

export default async function userRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Get current authenticated user
  server.get(
    "/me",
    {
      schema: {
        description: "Get the current authenticated user",
        tags: ["users"],
        response: {
          200: UserSchema,
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      // TODO: Implement authentication with Clerk
      // For now, return 401
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Authentication required. Please provide a valid token.",
      });
    },
  );

  // Get user by ID
  server.get<{ Params: { userId: string } }>(
    "/:userId",
    {
      schema: {
        description: "Get a user by ID",
        tags: ["users"],
        params: UserIdParams,
        response: {
          200: UserSchema,
          404: ErrorResponse,
          500: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.params;

      try {
        const user = await getUserById(userId);

        if (!user) {
          return reply.code(404).send({
            statusCode: 404,
            error: "Not Found",
            message: `User with ID ${userId} not found`,
          });
        }

        return user;
      } catch (error) {
        request.log.error(error, "Error fetching user");
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Failed to fetch user",
        });
      }
    },
  );

  // Update user
  server.patch<{
    Params: { userId: string };
    Body: { display_name?: string };
  }>(
    "/:userId",
    {
      schema: {
        description: "Update a user",
        tags: ["users"],
        params: UserIdParams,
        body: UserUpdateSchema,
        response: {
          200: UserSchema,
          400: ErrorResponse,
          404: ErrorResponse,
          500: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.params;
      const updates = request.body;

      try {
        // TODO: Add authentication check
        // TODO: Verify user has permission to update this user

        if (!updates.display_name) {
          return reply.code(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: "No update data provided",
          });
        }

        const updatedUser = await updateUser(userId, updates);

        if (!updatedUser) {
          return reply.code(404).send({
            statusCode: 404,
            error: "Not Found",
            message: `User with ID ${userId} not found or update failed`,
          });
        }

        return updatedUser;
      } catch (error) {
        request.log.error(error, "Error updating user");
        return reply.code(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Failed to update user",
        });
      }
    },
  );

  // List all users (admin only)
  server.get(
    "/",
    {
      schema: {
        description: "Get all users (admin only)",
        tags: ["users"],
        response: {
          200: Type.Object({
            users: Type.Array(UserSchema),
            total: Type.Number(),
          }),
          401: ErrorResponse,
          403: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      // TODO: Implement authentication
      // TODO: Check if user is admin

      return reply.code(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "Admin access required",
      });
    },
  );
}
