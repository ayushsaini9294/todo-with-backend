'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::todo.todo', ({ strapi }) => ({
  async find(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    ctx.query.filters = {
      ...(ctx.query.filters || {}),
      user: { id: ctx.state.user.id }
    };
    
    return await super.find(ctx);
  },

  async findOne(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    const { id } = ctx.params;
    const todo = await strapi.documents('api::todo.todo').findFirst({
      filters: {
        $or: [{ documentId: id }, { id: id }],
        user: { id: ctx.state.user.id }
      }
    });

    if (!todo) return ctx.notFound();

    return await super.findOne(ctx);
  },

  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    if (!ctx.request.body.data) ctx.request.body.data = {};
    ctx.request.body.data.user = ctx.state.user.id;

    return await super.create(ctx);
  },

  async update(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    const { id } = ctx.params;
    const todo = await strapi.documents('api::todo.todo').findFirst({
      filters: {
        $or: [{ documentId: id }, { id: id }],
        user: { id: ctx.state.user.id }
      }
    });

    if (!todo) return ctx.notFound();

    if (ctx.request.body.data) {
      delete ctx.request.body.data.user;
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    const { id } = ctx.params;
    const todo = await strapi.documents('api::todo.todo').findFirst({
      filters: {
        $or: [{ documentId: id }, { id: id }],
        user: { id: ctx.state.user.id }
      }
    });

    if (!todo) return ctx.notFound();

    return await super.delete(ctx);
  }
}));
