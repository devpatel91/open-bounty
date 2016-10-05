const router = require('express').Router();

const path = require('path');

const Project = require(path.join(__dirname, '../../../db/models/project'));

const GitHubApi = require("github");

const github = new GitHubApi({});

// get all projects for user
router.get('/all/owner/:ownerId', (req, res, next) => {
    Project.findAll({
            where: {
                ownerId: req.params.ownerId
            } 
        })
        .then(projects => {
            res.json(projects);
        })
        .catch(next);
});

// get single project
router.get('/one/:projectId', (req, res, next) => {
    const response = {}
    Project.findById(req.params.projectId)
        .then(project => {
	   response.project = project 
	    github.repos.getById({
		id: project.repoId
	    })
		.then(repo => {
		    response.repo = repo
		    res.json(response);
		}); 
        })
        .catch(next);
});

// create project
router.post('/new/', (req, res, next) => {
    Project.create(req.body)
        .then(project => {
            res.json(project);
        })
        .catch(next);
});

router.use('/github', require('./github'));

module.exports = router;
