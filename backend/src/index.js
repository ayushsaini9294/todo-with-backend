'use strict';

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    try {
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (authenticatedRole) {
        const actions = [
          'api::todo.todo.find',
          'api::todo.todo.findOne',
          'api::todo.todo.create',
          'api::todo.todo.update',
          'api::todo.todo.delete',
          'plugin::users-permissions.user.me',
          'plugin::users-permissions.user.find',
          'plugin::users-permissions.user.findOne'
        ];

        for (const action of actions) {
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: authenticatedRole.id }
          });

          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: authenticatedRole.id }
            });
          }
        }
      }

      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        const actions = [
          'plugin::users-permissions.auth.callback',
          'plugin::users-permissions.auth.register'
        ];

        for (const action of actions) {
          const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { action, role: publicRole.id }
          });

          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: publicRole.id }
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  },
};
