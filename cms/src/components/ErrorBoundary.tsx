import { Component, type ReactNode } from 'react';
import { Alert, Button } from '@mui/material';
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <Alert severity="error" action={<Button onClick={() => window.location.reload()}>再読み込み</Button>}>
      画面を表示できませんでした。保存されていない入力は、再読み込みすると失われます。
    </Alert> : this.props.children;
  }
}
