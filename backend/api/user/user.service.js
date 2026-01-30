import fs from 'fs';
import { loggerService } from "../../services/logger.service.js";
import { makeId, readJsonFile, writeJsonFile } from "../../services/utils.js";

export const userService = {
    query,
    getById,
    save,
    remove,
    getByEmail
};

let users;
try {
    users = readJsonFile('./data/users.json');
} catch (error) {
    loggerService.error(`Failed to read users.json: ${error}`);
    users = [];
}

async function query(filterBy = {}) {
    try {
        return users
    } catch (error) {
        loggerService.error(`Couldn't get users: ${error}`)
        throw error
    }
}

async function getByEmail(email) {
    try {
        const user = users.find(user => user.email === email)
        return user
    } catch (err) {
        loggerService.error('userService[getByEmail] : ', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const user = users.find(user => user._id === userId);
        if (!user) throw new Error(`Bad user id: ${userId}`);

        return user;
    } catch (error) {
        loggerService.error(`Couldn't get user with id ${userId}: ${error}`);
        throw error;
    }
}

async function remove(userId) {
    try {
        const idx = users.findIndex(user => user._id === userId);
        if (idx === -1) throw new Error(`Bad user id: ${userId}`);
        users.splice(idx, 1);
        await writeJsonFile('./data/users.json', users);
    } catch (error) {
        loggerService.error(`Error in userService.remove: ${error}`);
        throw error;
    }
}

async function save(user) {
    try {
        if (user._id) {
            const idx = users.findIndex(currUser => currUser._id === user._id);
            if (idx === -1) throw new Error(`Bad user id: ${user._id}`);
            users[idx] = user;
        } else {
            user._id = makeId();
            users.push(user);
        }
        await _saveUsersToFile();
        return user;
    } catch (error) {
        loggerService.error(`Error in userService.save: ${error}`);
        throw error;
    }
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {

        const usersStr = JSON.stringify(users, null, 2)
        fs.writeFile('data/users.json', usersStr, (err) => {
            if (err) {
                return console.log(err);
            }
            resolve()
        })
    })
}