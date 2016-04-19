function configRestaurant(nga, admin) {
    var restaurant = nga.entity('restaurantList');
    // set the fields of the user entity list view

    restaurant.listView().fields([
        nga.field('id'),
        nga.field('name'),
        nga.field('location'),
    ]);
    // add the user entity to the admin application
    admin.addEntity(restaurant);
}
