import { loggerService } from "../../services/logger.service.js";
import { bugService } from "./bug.service.js";

export async function getBugs(req, res) {
  try {
    const { title, severity, description, sortBy, descending, pageIdx } = req.query
    let labels = req.query.labels;
    // Normalize labels: if it's a string, split it by comma; if it's already an array, use it as is; otherwise, default to an empty array.
    if (labels) {
      if (typeof labels === 'string') {
        labels = labels.split(',');
      } else if (!Array.isArray(labels)) {
        labels = [labels];
      }
    } else {
      labels = [];
    }
    const filterBy = {
      title,
      severity: severity ? +severity : undefined,
      description,
      labels,
      sortBy,
      descending: descending === 'true',
      pageIdx: pageIdx ? +pageIdx : undefined
    }
    const bugs = await bugService.query(filterBy)
    res.send(bugs)
  } catch (err) {
    loggerService.error('Cannot get bugs', err)
    res.status(400).send('Cannot get bugs')
  }
}

export async function getBug(req, res) {
  try {
    const { bugId } = req.params;

    let visitedBugIds = req.cookies.visitedBugIds || [];
    if (!visitedBugIds.includes(bugId)) visitedBugIds.push(bugId);
    console.log(visitedBugIds);

    if (visitedBugIds.length > 3) return res.status(403).send('Wait for a bit');
    res.cookie('visitedBugIds', visitedBugIds, { maxAge: 1000 * 1000 });
    console.log(visitedBugIds);

    const bug = await bugService.getById(bugId);
    res.send(bug);
  } catch (err) {
    res.status(400).send('Couldn\'t get bug', err);
  }
}


export async function addBug(req, res) {
  try {
    const loggedinUser = req.loggedinUser
    // console.log(req);


    const { title, description, severity, labels = [] } = req.body
    // const bugToSave = { ...res.body, severity: +req.body.severity }
    const bugToSave = { title, labels, description, severity: +severity }
    const savedBug = await bugService.save(bugToSave, loggedinUser)
    res.send(savedBug)
  } catch (err) {
    loggerService.error('Cannot add bug', err)
    res.status(400).send('Cannot add bug')
  }
}

export async function updateBug(req, res) {
  try {
    const loggedinUser = req.loggedinUser

    const { _id, title, description, severity, labels = [] } = req.body
    const bugToSave = { _id, title, labels, description, severity: +severity }
    const savedBug = await bugService.save(bugToSave, loggedinUser)
    res.send(savedBug)
  } catch (err) {
    loggerService.error('Cannot update bug', err)
    res.status(400).send('Cannot update bug')
  }
}

export async function removeBug(req, res) {
  try {
    const loggedinUser = req.loggedinUser

    const { bugId } = req.params
    await bugService.remove(bugId, loggedinUser)
    res.send('Bug removed')
  } catch (err) {
    loggerService.error('Cannot remove bug', err)
    res.status(400).send('Cannot remove bug')
  }
}