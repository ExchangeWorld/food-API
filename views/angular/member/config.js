function configMember(nga, admin) {
    var user = nga.entity('memberList');
    user.listView()
        .fields([
            nga.field('id'),
            nga.field('user'),
            nga.field('username'),
            nga.field('level'),
            nga.field('facebookId')
        ])
        .perPage(20);

    admin.addEntity(user);
}
