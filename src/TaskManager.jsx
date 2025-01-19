import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Check, Play, Pause, Plus, X, Settings, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ... [Previous constants remain the same]

const TaskManager = () => {
  // ... [Previous state declarations and functions remain the same]

  return (
    <div className="p-3 md:p-6 max-w-2xl mx-auto min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4 border-0 bg-red-50 shadow-lg animate-in slide-in-from-top-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button 
            onClick={() => setError(null)} 
            className="absolute top-2 right-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Progress bar and time display */}
      <div className="mb-6 bg-white/80 rounded-3xl shadow-xl p-6 backdrop-blur-xl border border-white/20 transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Clock className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
            </div>
            <span className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Today's Progress
            </span>
          </div>
          <span className="font-mono text-3xl md:text-4xl text-gray-800 tracking-wider bg-blue-50 px-4 py-2 rounded-2xl">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
        
        {/* Progress bar section */}
        <div className="relative w-full">
          <div className="relative w-full h-5 md:h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 shadow-lg"
              style={{ width: `${(time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100}%` }}
            />
          </div>
          
          {/* Time markers */}
          <div className="relative w-full h-8 mt-3">
            {[6, 9, 12, 15, 18, 21].map(hour => (
              <div
                key={hour}
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                <div className="h-3 w-0.5 bg-gray-200" />
                <span className="text-sm font-medium text-gray-600 mt-1">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2 text-right text-lg font-medium text-blue-600">
            {((time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Settings and Add Task Form */}
      <div className="mb-6 bg-white/80 rounded-3xl shadow-xl p-6 backdrop-blur-xl border border-white/20 transition-all duration-300 hover:shadow-2xl">
        {/* Time Settings */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
              <span className="text-gray-700 font-medium">Focus</span>
              <input
                type="number"
                value={customPomodoroTime}
                onChange={handlePomodoroTimeChange}
                className="w-20 px-3 py-2 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-center text-lg transition-shadow"
                placeholder="25"
                min="1"
                max={MAX_POMODORO_TIME}
              />
              <span className="text-gray-700 font-medium">min</span>
            </div>
            
            <div className="inline-flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
              <span className="text-gray-700 font-medium">Break</span>
              <input
                type="number"
                value={customBreakTime}
                onChange={handleBreakTimeChange}
                className="w-20 px-3 py-2 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-center text-lg transition-shadow"
                placeholder="5"
                min="1"
                max={MAX_BREAK_TIME}
              />
              <span className="text-gray-700 font-medium">min</span>
            </div>
            
            <button
              onClick={updateTimes}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              <span>Update Settings</span>
            </button>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="flex-1 px-6 py-4 text-lg border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 transition-shadow"
            placeholder="Add new task..."
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <Plus className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        </form>
      </div>

      {/* Alerts */}
      {showTimerAlert && (
        <Alert className="mb-4 border-0 bg-blue-50 shadow-lg animate-in slide-in-from-top-4">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle>Timer Update</AlertTitle>
          <AlertDescription>{timerAlertMessage}</AlertDescription>
        </Alert>
      )}

      {showCompletionAlert && (
        <Alert className="mb-4 border-0 bg-green-50 shadow-lg animate-in slide-in-from-top-4">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Task Completed!</AlertTitle>
          <AlertDescription>{completedTaskMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tasks List */}
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3 px-2">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Calendar className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
              </div>
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            {tasksByDate[date].map(task => (
              <div
                key={task.id}
                className={`bg-white/80 backdrop-blur-xl shadow-lg border border-white/20 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl ${
                  activeTaskId === task.id ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-lg md:text-xl text-gray-700 block break-words font-medium">
                      {task.text}
                    </span>
                    {task.startAt && (
                      <div className="text-base text-blue-600 mt-2 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                        Started at: {formatDateTime(task.startAt)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {activeTaskId === task.id ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 shadow-sm">
                          <span className="text-lg md:text-xl font-mono font-semibold text-blue-700 min-w-[80px] text-center">
                            {formatTime(isBreakTime ? breakTime : pomodoroTime)}
                          </span>
                          <button
                            onClick={() => setIsBreakTime(!isBreakTime)}
                            className="px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-base font-medium"
                          >
                            {isBreakTime ? "Break" : "Focus"}
                          </button>
                          <button
                            onClick={resetTimer}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Pause className="w-6 h-6 md:w-7 md:h-7" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startPomodoro(task.id)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Start Focus"
                      >
                        <Play className="w-6 h-6 md:w-7 md:h-7" />
                      </button>
                    )}
                    <button
                      onClick={() => completeTask(task.id)}
                      className="p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Complete Task"
                    >
                      <Check className="w-6 h-6 md:w-7 md:h-7" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <X className="w-6 h-6 md:w-7 md:h-7" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-12 text-lg bg-white/80 rounded-3xl shadow-lg backdrop-blur-xl">
            No tasks yet. Start by adding a new task!
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-xl">
              <Check className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
            </div>
            Completed Tasks
          </h2>
          <div className="space-y-3">
            {sortedCompletedDates.map(date => (
              <div key={date} className="bg-white/80 rounded-2xl overflow-hidden shadow-lg backdrop-blur-xl border border-white/20 transition-all duration-300 hover:shadow-xl">
                <button
                  onClick={() => toggleDateExpansion(date)}
                  className="w-full px-4 py-3 bg-gray-50/80 flex items-center justify-between hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="text-lg font-medium text-gray-700">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',year: 'numeric'
                      })}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      ({completedTasksByDate[date].length} tasks)
                    </span>
                  </div>
                  {expandedDates.has(date) ? (
                    <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500 transition-transform duration-200" />
                  )}
                </button>
                
                {expandedDates.has(date) && (
                  <div className="divide-y divide-gray-100">
                    {completedTasksByDate[date].map(task => (
                      <div key={task.id} className="p-5 bg-white/90 hover:bg-white transition-colors duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="line-through text-lg text-gray-500 block break-words">
                              {task.text}
                            </span>
                            <div className="flex flex-col gap-2 text-sm text-gray-400 mt-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4"/>
                                <span>Started: {formatDateTime(task.startAt)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4"/>
                                <span>Completed: {formatDateTime(task.completedAt)}</span>
                              </div>
                              {calculateDuration(task.startAt, task.completedAt) && (
                                <div className="flex items-center gap-2 text-blue-500 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                                  <Clock className="w-4 h-4"/>
                                  <span>Duration: {calculateDuration(task.startAt, task.completedAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="bg-green-100 p-3 rounded-xl">
                            <Check className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;