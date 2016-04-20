function configMember(nga, admin) {
    var entity = nga.entity('memberList');
    entity.listView()
        .fields([
            nga.field('id'),
            nga.field('user'),
            nga.field('username'),
            nga.field('level'),
            nga.field('facebookId')
        ])
        .perPage(20)
        .batchActions([])
        .listActions(['show', 'edit'])

    entity
        .showView()
        .fields([
            nga.field('photo', 'template').template('<img src="{{ entry.values.photo }}" />'),
            nga.field('id'),
            nga.field('user'),
            nga.field('username'),
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
            nga.field('user', 'email'),
            nga.field('username'),
            nga.field('facebookId'),
            nga.field('createdAt')
                .editable(false),
            nga.field('updatedAt')
                .editable(false),
        ])


    admin.addEntity(entity);
}
