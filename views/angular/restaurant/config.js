function configRestaurant(nga, admin) {
    var entity = nga.entity('restaurantList');
    // set the fields of the user entity list view

    entity
        .listView()
        .fields([
            nga.field('id'),
            nga.field('name'),
            nga.field('location'),
        ])
        .listActions(['show', 'edit'])
        .batchActions([])


    entity
        .showView()
        .fields([
            nga.field('photo', 'template').template('<img src="{{ entry.values.photo }}" />'),
            nga.field('id'),
            nga.field('name'),
            nga.field('description'),
            nga.field('location'),
            nga.field('lat'),
            nga.field('lon'),
            nga.field('createdAt'),
            nga.field('updatedAt'),
        ])

    entity
        .editionView()
        .fields([
            nga.field('photo', 'template')
                .template('<img src="{{ entry.values.photo }}" />')
                .editable(false),
            nga.field('id')
                .editable(false),
            nga.field('name'),
            nga.field('description'),
            nga.field('location'),
            nga.field('lat', 'float'),
            nga.field('lon', 'float'),
            nga.field('createdAt')
                .editable(false),
            nga.field('updatedAt')
                .editable(false),
        ])


    admin.addEntity(entity);
}
