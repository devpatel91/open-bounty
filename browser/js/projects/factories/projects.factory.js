app.factory('ProjectsFactory', function($http, $log, AuthService) {
    function getData (res) {
        return res.data;
    }
    function getForUser() {
        return $http.get('/api/projects/')
        .then(getData)
        .catch($log.error);
    }
    function getIssues (projectId) {
        return $http.get('/api/projects/' + projectId + '/issues')
            .then(getData)
            .catch($log.error);
    }
    // let ProjectFactory = {}


    function addProject (repo, description) {

        let data = {
            repoId: repo.id,
            name: repo.name,
            description: description.$modelValue
        }

        return AuthService.getLoggedInUser()
            .then(function(user) {
                data.ownerId = user.id;
                return $http.post('/api/projects/new', data);
            })
            .catch(console.log);
    }

    function findProject (user) {
        return AuthService.getLoggedInUser()
            .then(function(user) {
                return $http.get('/api/projects/all/owner/' + user.id);
            })
            .then(function(project) {
                return project.data;
            })

    }

    function findSingleProject (projectId) {
        return $http.get('/api/bounties/' + projectId)
            .then(function(project) {
                return project.data;
            })
    }

    const findOneById = projectId => $http.get(`/api/projects/one/${projectId}`)
	    .then(project => project.data);

    // return ProjectFactory;
    return {
        getForUser,
        getIssues,
        findOneById,
        findProject,
        addProject,
        findSingleProject
    }
});
