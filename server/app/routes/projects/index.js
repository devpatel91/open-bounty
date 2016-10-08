'use strict';

const router = require('express').Router();

const path = require('path');
const Promise = require('bluebird');

const Project = require(path.join(__dirname, '../../../db/models/project'));

// get all projects for user -------- It's goood-----
router.get('/', (req, res, next) => {
    Project.findAll({
            where: {
                ownerId: req.user.id
            }
        })
        .then(projects => Promise.map(projects, project => project.attachBounties()))
        .then(projectsWithBounties => res.send(projectsWithBounties))
        .catch(next);
});

// create project
router.post('/', (req, res, next) => {
    const projectData = req.body;
    projectData.ownerId = req.user.id;

    Project.create(projectData)
        .then(project => {
            console.log(project)
            res.json(project);
        })
        .catch(next);
});


router.get('/:projectName/issues', (req, res, next) => {
    function getIssuesPage (pageNum) {
        return req.github.issues.getForRepo({
            user: req.user.id,
            repo: req.params.projectName,
            per_page: 100,
            page: pageNum
        });
    }

    function getAllIssues (pageNum, issues) {
        return getIssuesPage(pageNum)
            .then(pageIssues => {
                if (pageIssues.length < 100) {
                    return issues.concat(pageIssues);
                }
                return getAllIssues(pageNum + 1, issues.concat(pageIssues));
            });
    }

    getAllIssues (1, [])
        .then(allIssues => {
            console.log('LENGTH', allIssues.length)
            res.send(allIssues);
        })
        .catch(next);
});

router.param('projectId', (req, res, next, projectId) => {
    Project.findById(projectId)
        .then(project => {
            req.project = project;
            next();
        })
        .catch(next);
})

// get single project
router.get('/one/:projectId', (req, res, next) => {
    const response = {}
    Project.findById(req.params.projectId)
        .then(project => {
            response.project = project
            return req.github.repos.getById({
                    id: project.repoId
                })
                .then(repo => {
                    response.repo = repo
                    res.json(response);
                });
        })
        .catch(next);
});

router.use('/github', require('./github'));

module.exports = router;
