import { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { getUserById, updateUser, isAdmin, User } from "@kontaktar/database";

// Define schemas for request/response validation
const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  phone_number: Type.Union([Type.String(), Type.Null()]),
  display_name: Type.Union([Type.String(), Type.Null()]),
  role: Type.Union([Type.Literal('user'), Type.Literal('admin')]),
  created_at: Type.String({ format: 'date-time' })
});

const UserUpdateSchema = Type.Object({
  display_name: Type.Optional(Type.String())
});

const UserParams = Type.Object({
  userId: Type.String({ format: 'uuid' })
});

const ErrorResponse = Type.Object({
  statusCode: Type.Number(),
  error: Type.String(),
  message: Type.String()
});

export default async function userRoutes(fastify: FastifyInstance) {
  // Use TypeBox for validation
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Get current authenticated user
  server.get(
    "/me",
    {
      schema: {
        response: {
          200: UserSchema,
          401: ErrorResponse
        }
      }
    },
    async (request, reply) => {
      // In a real implementation, this would use Supabase auth
      // For now, we'll return a mock unauthorized error
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Authentication required"
      });

      // The real implementation would look like this:
      // const user = await getCurrentUser();
      // if (!user) {
      //   return reply.code(401).send({
      //     statusCode: 401,
      //     error: "Unauthorized",
      //     message: "Authentication required"
      //   });
      // }
      // return user;
    }
  );

  // Get user by ID
  server.get<{ Params: { userId: string } }>(
    "/:userId",
    {
      schema: {
        params: UserParams,
        response: {
          200: UserSchema,
          404: ErrorResponse
        }
      }
    },
    async (request, reply) => {
      const { userId } = request.params;

      // In a real implementation, this would check auth and permissions
      // For now, we'll simulate the database call
      const user = await getUserById(userId);

      if (!user) {
        return reply.code(404).send({
          statusCode: 404,
          error: "Not Found",
          message: "User not found"
        });
      }

      return user;
    }
  );

  // Update user
  server.patch<{
    Params: { userId: string },
    Body: { display_name?: string }
  }>(
    "/:userId",
    {
      schema: {
        params: UserParams,
        body: UserUpdateSchema,
        response: {
          200: UserSchema,
          401: ErrorResponse,
          404: ErrorResponse
        }
      }
    },
    async (request, reply) => {
      const { userId } = request.params;
      const updates = request.body;

      // In a real implementation, this would:
      // 1. Check if user is authenticated
      // 2. Verify they have permission to update this user

      // For now, we'll simulate the database call
      const updatedUser = await updateUser(userId, updates);

      if (!updatedUser) {
        return reply.code(404).send({
          statusCode: 404,
          error: "Not Found",
          message: "User not found or update failed"
        });
      }

      return updatedUser;
    }
  );

  // Admin-only: Get all users
  server.get(
    "/",
    {
      schema: {
        response: {
          200: Type.Array(UserSchema),
          401: ErrorResponse,
          403: ErrorResponse
        }
      }
    },
    async (request, reply) => {
      // In a real implementation, this would:
      // 1. Check if user is authenticated
      // 2. Check if user is an admin

      // For demonstration, we'll return a forbidden error
      return reply.code(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "Admin access required"
      });

      // The real implementation would query the database for all users
      // and return the results if the requester is an admin
    }
  );
}
