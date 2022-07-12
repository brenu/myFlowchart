/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/flowcharts', 'FlowchartsController.index');

Route.post('login', async ({ auth, request, response }) => {
  try {
    const username = request.input('username');
    const password = request.input('password');

    const result = await auth.use('api').attempt(username, password);

    return response.json({
      token: result.token,
      role: result.user.$original.role
    });
  } catch (error) {
    return response.status(400).json({ message: "Os dados não coincidem" });
  }
});

Route.post('forgot', "ForgotController.store");
Route.put('reset/:token', "ForgotController.update");

Route.post('student', "StudentsController.store");
Route.post('coordinator', "CoordinatorsController.store");

Route.group(() => {
  Route.group(() => {
    Route.get('student/:flowchart-id', "StudentsController.show");
    Route.put('student-subject/:subject-id', "StudentSubjectsController.update");
    Route.get('student-flowcharts', "StudentSubjectsController.index");

    Route.post('comments', "CommentsController.store");
    Route.delete('comments/:comment-id', "CommentsController.destroy");
    Route.get('student/privacy/:flowchart-id', 'PrivacySettingsController.show');
    Route.put('student/privacy/:flowchart-id', 'PrivacySettingsController.update');

  }).middleware(async ({ request, response }, next) => {
    const user = request.session_user;

    if (!user || user.role !== "student") {
      return response.status(403);
    }

    await next();
  });

  Route.group(() => {

    Route.get('coordinator/subject', 'CoordinatorSubjectsController.index');
    Route.post('coordinator/subject', 'CoordinatorSubjectsController.store');
    Route.put('coordinator/subject/:subject-id', 'CoordinatorSubjectsController.update');
    Route.delete('coordinator/subject/:subject-id', 'CoordinatorSubjectsController.destroy');

  }).middleware(async ({ request, response }, next) => {
    const user = request.session_user;

    if (!user || user.role !== "coordinator") {
      return response.status(403);
    }

    await next();
  });

}).middleware('auth:api');