import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { OpenApiMeta } from 'trpc-openapi';

// Initialize tRPC with OpenAPI meta support
const t = initTRPC.meta<OpenApiMeta>().create();

/**
 * @openapi
 * /hello:
 *   get:
 *     summary: Returns a greeting message
 *     description: Returns a greeting message. Optionally pass a name.
 *     tags:
 *       - Greeting
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Name to greet
 *     responses:
 *       200:
 *         description: Greeting response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 greeting:
 *                   type: string
 */
export const appRouter = t.router({
  hello: t.procedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/hello',
        summary: 'Returns a greeting message',
        description: 'Returns a greeting message. Optionally pass a name.',
        tags: ['Greeting'],
      },
    })
    .input(z.object({ name: z.string().optional() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello, ${input?.name ?? 'world'}!`,
      };
    }),

  /**
   * @openapi
   * /user:
   *   post:
   *     summary: Create a new user
   *     description: Creates a new user with a name and email.
   *     tags:
   *       - User
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   */
  userCreate: t.procedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/user',
        summary: 'Create a new user',
        description: 'Creates a new user with a name and email.',
        tags: ['User'],
      },
    })
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .output(z.object({ id: z.string(), name: z.string(), email: z.string() }))
    .mutation(({ input }) => {
      // Example implementation
      return { id: 'user_123', ...input };
    }),

  /**
   * @openapi
   * /user/{id}:
   *   get:
   *     summary: Get user by ID
   *     description: Retrieves a user by their unique ID.
   *     tags:
   *       - User
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *       404:
   *         description: User not found
   */
  userGet: t.procedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/user/{id}',
        summary: 'Get user by ID',
        description: 'Retrieves a user by their unique ID.',
        tags: ['User'],
      },
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), name: z.string(), email: z.string() }))
    .query(({ input }) => {
      // Example implementation
      if (input.id === 'user_123') {
        return { id: 'user_123', name: 'Alice', email: 'alice@example.com' };
      }
      throw new Error('User not found');
    }),

  /**
   * @openapi
   * /user/{id}:
   *   put:
   *     summary: Update user by ID
   *     description: Updates a user's name and email by their unique ID.
   *     tags:
   *       - User
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: User updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *       404:
   *         description: User not found
   */
  userUpdate: t.procedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/user/{id}',
        summary: 'Update user by ID',
        description: "Updates a user's name and email by their unique ID.",
        tags: ['User'],
      },
    })
    .input(
      z.object({ id: z.string(), name: z.string(), email: z.string().email() })
    )
    .output(z.object({ id: z.string(), name: z.string(), email: z.string() }))
    .mutation(({ input }) => {
      // Example implementation
      if (input.id === 'user_123') {
        return { id: input.id, name: input.name, email: input.email };
      }
      throw new Error('User not found');
    }),

  /**
   * @openapi
   * /user/{id}:
   *   delete:
   *     summary: Delete user by ID
   *     description: Deletes a user by their unique ID.
   *     tags:
   *       - User
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     responses:
   *       204:
   *         description: User deleted
   *       404:
   *         description: User not found
   */
  userDelete: t.procedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/user/{id}',
        summary: 'Delete user by ID',
        description: 'Deletes a user by their unique ID.',
        tags: ['User'],
      },
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .mutation(({ input }) => {
      // Example implementation
      if (input.id === 'user_123') {
        return;
      }
      throw new Error('User not found');
    }),
});

export type AppRouter = typeof appRouter;

export function createContext() {
  return {};
}
