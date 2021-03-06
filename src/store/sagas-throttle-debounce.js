import {
  fork,
  call,
  take,
  throttle,
  actionChannel,
  delay,
  debounce,
  cancel,
  takeLatest,
} from 'redux-saga/effects'
import { buffers } from 'redux-saga'

import { saveFriendlyName } from '../api/user'
import { CHANGE_USERNAME } from './actions'

function* changeUsername(action) {
  console.log('username', action.payload.username)
  yield call(saveFriendlyName, action.payload.username)
}

const throttle2 = (ms, pattern, task, ...args) =>
  fork(function* () {
    const throttleChannel = yield actionChannel(pattern, buffers.sliding(1))

    while (true) {
      const action = yield take(throttleChannel)
      yield fork(task, ...args, action)
      yield delay(ms)
    }
  })

function* debounce2(ms, pattern, task, ...args) {
  let _task
  while (true) {
    const action = yield take(pattern)
    if (_task) {
      yield cancel(_task)
    }
    _task = yield fork(function* () {
      yield delay(ms)
      yield fork(task, ...args, action)
    })
  }
}

function* debounce3(ms, pattern, task, ...args) {
  yield takeLatest(pattern, function* (action) {
    yield delay(ms)
    yield fork(task, ...args, action)
  })
}

export function* sagaThrottleDebounce() {
  // compare with:
  // while (true) {
  //   const action = yield take(CHANGE_USERNAME)
  //   yield fork(changeUsername, action)
  // }

  // yield throttle(500, CHANGE_USERNAME, changeUsername)
  // yield throttle2(500, CHANGE_USERNAME, changeUsername)

  // yield debounce(500, CHANGE_USERNAME, changeUsername)
  // yield debounce2(500, CHANGE_USERNAME, changeUsername)
  yield debounce3(500, CHANGE_USERNAME, changeUsername)
}
