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

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('login', async ({ auth, request, response }) => {
  try {
    const username = request.input('username');
    const password = request.input('password');

    const result = await auth.use('api').attempt(username, password);

    return response.json(result);
  } catch (error) {
    return response.status(400).json({ message: "Os dados não coincidem" });
  }
});

Route.post('forgot', "ForgotController.store");
Route.put('reset/:token', "ForgotController.update");

Route.post('student', "StudentsController.store");
Route.post('coordinator', "CoordinatorsController.store");

Route.get('student/:flowchart-id', "StudentsController.show").middleware('auth:api');
Route.put('student-subject/:subject-id', "StudentSubjectsController.update").middleware('auth:api');
Route.get('student-flowcharts', "StudentSubjectsController.index").middleware('auth:api');