## GET /api/metrics/performance
{
  "totalMethods": 4,
  "metrics": {
    "PostService.getAllPosts(..)": {
      "methodName": "PostService.getAllPosts(..)",
      "totalCalls": 17,
      "successfulCalls": 17,
      "failedCalls": 0,
      "totalExecutionTime": 833,
      "minExecutionTime": 8,
      "maxExecutionTime": 245,
      "averageExecutionTime": 49
    },
    .
    .
    .
    "CommentService.getAllCommentsByPostId(..)": {
      "methodName": "CommentService.getAllCommentsByPostId(..)",
      "totalCalls": 1,
      "successfulCalls": 1,
      "failedCalls": 0,
      "totalExecutionTime": 40,
      "minExecutionTime": 40,
      "maxExecutionTime": 40,
      "averageExecutionTime": 40
    }
  },
  "timestamp": "2026-01-27T12:35:30.324+00:00"
}

## GET /api/metrics/performance/summary

{
  "totalFailures": 2,
  "overallAverageExecutionTime": "19.83 ms",
  "totalExecutions": 32,
  "totalMethodsMonitored": 6,
  "timestamp": "2026-01-27T12:45:44.500+00:00"
}

## POST /api/metrics/performance/export-log

{
  "status": "success",
  "message": "Metrics exported to application log"
}

## DELETE /api/metrics/performance/reset

{
	"status": "success",
	"message": "Performance metrics have been reset"
}